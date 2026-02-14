package upstage.gateway.workflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import upstage.gateway.workflow.model.Workflow;
import upstage.gateway.workflow.model.WorkflowEdge;
import upstage.gateway.workflow.model.WorkflowNode;
import upstage.gateway.workflow.input.InputNode;
import upstage.gateway.workflow.uie.UieNode;
import upstage.gateway.workflow.uie.UieNodeConfig;
import upstage.gateway.workflow.uie.UieResponseParser;
import upstage.gateway.workflow.transform.TransformNode;
import upstage.gateway.workflow.transform.DataTransformer;
import upstage.gateway.workflow.connector.ConnectorNode;
import upstage.gateway.workflow.connector.ConnectorNodeConfig;
import upstage.gateway.workflow.output.OutputNode;
import upstage.gateway.workflow.splitter.SplitterNode;
import upstage.gateway.workflow.splitter.SplitterNodeConfig;
import upstage.gateway.workflow.merger.MergerNode;
import upstage.gateway.workflow.merger.MergerNodeConfig;
import upstage.gateway.workflow.googlesheets.GoogleSheetsNode;
import upstage.gateway.workflow.googlesheets.GoogleSheetsNodeConfig;
import upstage.gateway.workflow.execution.ExecutionContext;
import upstage.gateway.workflow.execution.ExecutionHistoryService;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class WorkflowExecutionService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final WorkflowService workflowService;
    private final RestTemplate restTemplate;
    private final ExecutionHistoryService executionHistory;
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    public WorkflowExecutionService(WorkflowService workflowService,
                                     RestTemplate restTemplate,
                                     ExecutionHistoryService executionHistory) {
        this.workflowService = workflowService;
        this.restTemplate = restTemplate;
        this.executionHistory = executionHistory;
    }

    /* ── Single-file execute (backward compatible) ── */

    public ResponseEntity<?> execute(String workflowId, MultipartFile file) {
        return executeBatch(workflowId, file != null ? new MultipartFile[]{file} : new MultipartFile[0], null);
    }

    /* ── Multi-file batch execute ── */

    public ResponseEntity<?> executeBatch(String workflowId, MultipartFile[] files, String requestId) {
        Optional<Workflow> opt = workflowService.findById(workflowId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Workflow workflow = opt.get();
        if (workflow.getNodes() == null || workflow.getEdges() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid workflow definition"));
        }

        int fileCount = files != null ? files.length : 0;
        ExecutionContext ctx = executionHistory.create(requestId, workflowId, fileCount);

        try {
            Object result = runWorkflow(workflow, files, ctx);
            ctx.markSuccess(result);
            return ResponseEntity.ok(Map.of(
                    "requestId", ctx.getRequestId(),
                    "status", ctx.getStatus(),
                    "totalFiles", ctx.getTotalFiles(),
                    "processedFiles", ctx.getProcessedFiles(),
                    "result", result != null ? result : Map.of()
            ));
        } catch (Exception e) {
            ctx.markFailed(e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("requestId", ctx.getRequestId(), "status", "FAILED", "error", e.getMessage()));
        }
    }

    /* ── Preview (single-file, UIE only) ── */

    public ResponseEntity<?> preview(String workflowId, MultipartFile file) {
        Optional<Workflow> opt = workflowService.findById(workflowId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Workflow workflow = opt.get();
        if (workflow.getNodes() == null || workflow.getEdges() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid workflow definition"));
        }
        try {
            Object result = runWorkflowUntilUie(workflow, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /* ── Core engine ── */

    private Object runWorkflow(Workflow workflow, MultipartFile[] files, ExecutionContext ctx) throws Exception {
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();
        String currentNodeId = findInputNodeId(nodes);
        if (currentNodeId == null) throw new IllegalArgumentException("Workflow must have Input node");

        Object currentResult = null;
        MultipartFile[] currentFiles = files;

        while (currentNodeId != null) {
            final String nodeId = currentNodeId;
            WorkflowNode node = nodes.stream()
                    .filter(n -> n.getId().equals(nodeId)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

            if (node instanceof InputNode) {
                // pass-through
            } else if (node instanceof SplitterNode splitter) {
                // Fan-out: parallel UIE calls for each file
                currentResult = executeFanOut(splitter, nodes, edges, currentFiles, ctx);
                // After fan-out, skip to merger node
                currentNodeId = findMergerNodeId(nodes, edges, currentNodeId);
                continue;
            } else if (node instanceof MergerNode merger) {
                // Fan-in: merge parallel results
                currentResult = executeMerge(merger, currentResult, currentFiles);
            } else if (node instanceof UieNode uie) {
                // Single-file UIE (backward compatible, uses first file)
                UieNodeConfig config = uie.getConfig();
                if (config == null || config.getUrl() == null || config.getUrl().isBlank()) {
                    throw new IllegalArgumentException("UIE node has no URL configured");
                }
                MultipartFile singleFile = (currentFiles != null && currentFiles.length > 0) ? currentFiles[0] : null;
                currentResult = callUieApi(config, singleFile);
                String json = currentResult instanceof String s ? s : MAPPER.writeValueAsString(currentResult);
                currentResult = UieResponseParser.parse(json, config);
                ctx.incrementProcessed();
            } else if (node instanceof TransformNode transform) {
                if (currentResult == null) throw new IllegalArgumentException("Transform node requires preceding output");
                currentResult = DataTransformer.transform(currentResult, transform.getConfig());
            } else if (node instanceof ConnectorNode connector) {
                ConnectorNodeConfig config = connector.getConfig();
                if (config != null && "http".equals(config.getType()) && config.getUrl() != null && !config.getUrl().isBlank()) {
                    callHttpConnector(config, currentResult);
                }
            } else if (node instanceof GoogleSheetsNode sheets) {
                currentResult = callGoogleSheets(sheets.getConfig(), currentResult);
            } else if (node instanceof OutputNode) {
                break;
            }

            ctx.getNodeResults().put(nodeId, currentResult != null ? currentResult : "null");
            currentNodeId = findNextNodeId(edges, currentNodeId);
        }

        return currentResult;
    }

    /* ── Fan-out: Splitter → UIE (parallel) ── */

    @SuppressWarnings("unchecked")
    private Object executeFanOut(SplitterNode splitter, List<WorkflowNode> nodes,
                                  List<WorkflowEdge> edges, MultipartFile[] files,
                                  ExecutionContext ctx) throws Exception {
        if (files == null || files.length == 0) {
            return List.of();
        }

        // Find the UIE node connected after the splitter
        String uieNodeId = findNextNodeId(edges, splitter.getId());
        if (uieNodeId == null) throw new IllegalArgumentException("Splitter must connect to a UIE node");

        WorkflowNode uieNodeRaw = nodes.stream()
                .filter(n -> n.getId().equals(uieNodeId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("UIE node not found after Splitter"));
        if (!(uieNodeRaw instanceof UieNode uieNode)) {
            throw new IllegalArgumentException("Splitter must connect to a UIE node, found: " + uieNodeRaw.getClass().getSimpleName());
        }

        UieNodeConfig config = uieNode.getConfig();
        if (config == null || config.getUrl() == null || config.getUrl().isBlank()) {
            throw new IllegalArgumentException("UIE node has no URL configured");
        }

        SplitterNodeConfig splitterConfig = splitter.getConfig();
        int maxParallel = (splitterConfig != null && splitterConfig.getMaxParallel() > 0)
                ? splitterConfig.getMaxParallel() : files.length;

        // Execute UIE calls in parallel
        List<CompletableFuture<Map<String, Object>>> futures = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            final MultipartFile file = files[i];
            final int index = i;
            CompletableFuture<Map<String, Object>> future = CompletableFuture.supplyAsync(() -> {
                try {
                    Object raw = callUieApi(config, file);
                    String json = raw instanceof String s ? s : MAPPER.writeValueAsString(raw);
                    Object parsed = UieResponseParser.parse(json, config);
                    ctx.incrementProcessed();

                    // Wrap result with file metadata
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("_fileIndex", index);
                    entry.put("_fileName", file.getOriginalFilename());
                    if (parsed instanceof Map) {
                        entry.putAll((Map<String, Object>) parsed);
                    } else {
                        entry.put("data", parsed);
                    }
                    return entry;
                } catch (Exception e) {
                    Map<String, Object> errorEntry = new LinkedHashMap<>();
                    errorEntry.put("_fileIndex", index);
                    errorEntry.put("_fileName", file.getOriginalFilename());
                    errorEntry.put("_error", e.getMessage());
                    return errorEntry;
                }
            }, executor);
            futures.add(future);
        }

        // Collect all results
        List<Map<String, Object>> results = futures.stream()
                .map(CompletableFuture::join)
                .sorted(Comparator.comparingInt(m -> (int) m.getOrDefault("_fileIndex", 0)))
                .collect(Collectors.toList());

        ctx.getFileResults().addAll(results);
        return results;
    }

    /* ── Fan-in: Merger ── */

    @SuppressWarnings("unchecked")
    private Object executeMerge(MergerNode merger, Object input, MultipartFile[] files) {
        if (!(input instanceof List<?> list)) return input;
        List<Map<String, Object>> results = list.stream()
                .filter(item -> item instanceof Map)
                .map(item -> (Map<String, Object>) item)
                .collect(Collectors.toList());

        MergerNodeConfig config = merger.getConfig();
        String strategy = (config != null && config.getStrategy() != null) ? config.getStrategy() : "array";

        boolean includeMetadata = config == null || config.isIncludeFileMetadata();
        if (!includeMetadata) {
            results.forEach(r -> {
                r.remove("_fileIndex");
                r.remove("_fileName");
            });
        }

        return switch (strategy) {
            case "flat_merge" -> {
                Map<String, Object> merged = new LinkedHashMap<>();
                for (Map<String, Object> r : results) {
                    merged.putAll(r);
                }
                yield merged;
            }
            case "grouped" -> {
                String groupKey = config != null ? config.getGroupByKey() : null;
                if (groupKey == null) yield results;
                yield results.stream().collect(Collectors.groupingBy(
                        r -> String.valueOf(r.getOrDefault(groupKey, "unknown"))
                ));
            }
            default -> Map.of(
                    "totalFiles", results.size(),
                    "items", results
            );
        };
    }

    /* ── Google Sheets ── */

    private Object callGoogleSheets(GoogleSheetsNodeConfig config, Object data) throws Exception {
        if (config == null || config.getWebhookUrl() == null || config.getWebhookUrl().isBlank()) {
            return data; // pass-through if not configured
        }

        // Build rows from data
        List<List<Object>> rows = new ArrayList<>();
        List<String> columnKeys = config.getColumnKeys();

        if (data instanceof Map<?,?> mapData) {
            Object items = mapData.get("items");
            if (items instanceof List<?> list) {
                if (config.isIncludeHeader() && columnKeys != null && !columnKeys.isEmpty()) {
                    rows.add(new ArrayList<>(columnKeys));
                }
                for (Object item : list) {
                    if (item instanceof Map<?,?> row) {
                        List<Object> rowData = new ArrayList<>();
                        if (columnKeys != null) {
                            for (String key : columnKeys) {
                                rowData.add(row.getOrDefault(key, ""));
                            }
                        } else {
                            rowData.addAll(row.values());
                        }
                        rows.add(rowData);
                    }
                }
            }
        }

        // POST to Google Sheets webhook/Apps Script
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sheetName", config.getSheetName());
        payload.put("rows", rows);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String json = MAPPER.writeValueAsString(payload);
        HttpEntity<String> request = new HttpEntity<>(json, headers);

        try {
            restTemplate.exchange(config.getWebhookUrl(), HttpMethod.POST, request, String.class);
        } catch (Exception e) {
            // Log but don't fail the workflow for Sheets errors
        }

        return data; // pass-through
    }

    /* ── Helpers ── */

    private String findMergerNodeId(List<WorkflowNode> nodes, List<WorkflowEdge> edges, String splitterId) {
        // Walk forward from splitter → UIE → merger
        String nextId = findNextNodeId(edges, splitterId);
        while (nextId != null) {
            String id = nextId;
            WorkflowNode node = nodes.stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
            if (node instanceof MergerNode) return node.getId();
            nextId = findNextNodeId(edges, nextId);
        }
        return null;
    }

    private Object runWorkflowUntilUie(Workflow workflow, MultipartFile file) throws Exception {
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();
        String currentNodeId = findInputNodeId(nodes);
        if (currentNodeId == null) throw new IllegalArgumentException("Workflow must have Input node");

        Object currentResult = null;
        while (currentNodeId != null) {
            final String nodeId = currentNodeId;
            WorkflowNode node = nodes.stream()
                    .filter(n -> n.getId().equals(nodeId)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

            if (node instanceof InputNode || node instanceof SplitterNode) {
                currentNodeId = findNextNodeId(edges, currentNodeId);
                continue;
            }
            if (node instanceof UieNode uie) {
                UieNodeConfig config = uie.getConfig();
                if (config == null || config.getUrl() == null || config.getUrl().isBlank()) {
                    throw new IllegalArgumentException("UIE node has no URL configured");
                }
                currentResult = callUieApi(config, file);
                String json = currentResult instanceof String s ? s : MAPPER.writeValueAsString(currentResult);
                currentResult = UieResponseParser.parse(json, config);
                return currentResult;
            }
            if (node instanceof TransformNode || node instanceof ConnectorNode || node instanceof OutputNode) break;
            currentNodeId = findNextNodeId(edges, currentNodeId);
        }
        return currentResult;
    }

    private String findInputNodeId(List<WorkflowNode> nodes) {
        return nodes.stream().filter(n -> n instanceof InputNode).map(WorkflowNode::getId).findFirst().orElse(null);
    }

    private String findNextNodeId(List<WorkflowEdge> edges, String sourceId) {
        if (sourceId == null) return null;
        return edges.stream().filter(e -> sourceId.equals(e.getSourceNodeId())).map(WorkflowEdge::getTargetNodeId).findFirst().orElse(null);
    }

    private Object callUieApi(UieNodeConfig config, MultipartFile file) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        if (config.getFormFields() != null) config.getFormFields().forEach(body::add);
        if (file != null && !file.isEmpty()) {
            String fieldName = config.getFileFieldName() != null ? config.getFileFieldName() : "file";
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
                }
            };
            body.add(fieldName, resource);
        }
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        String method = config.getMethod() != null ? config.getMethod().toUpperCase() : "POST";
        ResponseEntity<String> response = restTemplate.exchange(config.getUrl(), HttpMethod.valueOf(method), request, String.class);
        return response.getBody();
    }

    private void callHttpConnector(ConnectorNodeConfig config, Object body) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (config.getHeaders() != null) config.getHeaders().forEach(headers::set);
        String json = body instanceof String s ? s : MAPPER.writeValueAsString(body);
        HttpEntity<String> request = new HttpEntity<>(json, headers);
        String method = config.getMethod() != null ? config.getMethod().toUpperCase() : "POST";
        restTemplate.exchange(config.getUrl(), HttpMethod.valueOf(method), request, String.class);
    }
}
