package upstage.gateway.workflow;

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
import upstage.gateway.workflow.transform.TransformNodeConfig;
import upstage.gateway.workflow.transform.DataTransformer;
import upstage.gateway.workflow.connector.ConnectorNode;
import upstage.gateway.workflow.connector.ConnectorNodeConfig;
import upstage.gateway.workflow.output.OutputNode;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class WorkflowExecutionService {

    private final WorkflowService workflowService;
    private final RestTemplate restTemplate;

    public WorkflowExecutionService(WorkflowService workflowService, RestTemplate restTemplate) {
        this.workflowService = workflowService;
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<?> execute(String workflowId, MultipartFile file) {
        Optional<Workflow> opt = workflowService.findById(workflowId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Workflow workflow = opt.get();

        if (workflow.getNodes() == null || workflow.getEdges() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid workflow definition"));
        }

        try {
            Object result = runWorkflow(workflow, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 미리보기 - UIE 노드 실행 (호출+파싱) 결과 반환
     */
    public ResponseEntity<?> preview(String workflowId, MultipartFile file) {
        Optional<Workflow> opt = workflowService.findById(workflowId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Workflow workflow = opt.get();
        if (workflow.getNodes() == null || workflow.getEdges() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid workflow definition"));
        }
        try {
            Object result = runWorkflowUntilUie(workflow, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** UIE 노드 실행 (호출 + 파싱) 후 반환 */
    private Object runWorkflowUntilUie(Workflow workflow, MultipartFile file) throws Exception {
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();

        String inputNodeId = findInputNodeId(nodes);
        String currentNodeId = inputNodeId;
        if (currentNodeId == null) {
            throw new IllegalArgumentException("Workflow must have Input node");
        }

        Object currentResult = null;

        while (currentNodeId != null) {
            final String nodeId = currentNodeId;
            WorkflowNode node = nodes.stream()
                    .filter(n -> n.getId().equals(nodeId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

            if (node instanceof InputNode) {
                currentNodeId = findNextNodeId(edges, currentNodeId);
                continue;
            }

            if (node instanceof UieNode uie) {
                UieNodeConfig config = uie.getConfig();
                if (config == null || config.getUrl() == null || config.getUrl().isBlank()) {
                    throw new IllegalArgumentException("UIE node has no URL configured");
                }
                currentResult = callUieApi(config, file);
                String json = currentResult instanceof String s ? s : new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(currentResult);
                currentResult = UieResponseParser.parse(json, config);
                return currentResult;
            }
            if (node instanceof TransformNode || node instanceof ConnectorNode || node instanceof OutputNode) {
                break;
            }
            currentNodeId = findNextNodeId(edges, currentNodeId);
        }

        return currentResult;
    }

    private Object runWorkflow(Workflow workflow, MultipartFile file) throws Exception {
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();

        String inputNodeId = findInputNodeId(nodes);
        String currentNodeId = inputNodeId;

        if (currentNodeId == null) {
            throw new IllegalArgumentException("Workflow must have Input node");
        }

        Object currentResult = null;

        while (currentNodeId != null) {
            final String nodeId = currentNodeId;
            WorkflowNode node = nodes.stream()
                    .filter(n -> n.getId().equals(nodeId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

            if (node instanceof InputNode) {
                currentNodeId = findNextNodeId(edges, currentNodeId);
                continue;
            }

            if (node instanceof UieNode uie) {
                UieNodeConfig config = uie.getConfig();
                if (config == null || config.getUrl() == null || config.getUrl().isBlank()) {
                    throw new IllegalArgumentException("UIE node has no URL configured");
                }
                currentResult = callUieApi(config, file);
                String json = currentResult instanceof String s ? s : new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(currentResult);
                currentResult = UieResponseParser.parse(json, config);
            } else if (node instanceof TransformNode transform) {
                if (currentResult == null) {
                    throw new IllegalArgumentException("Transform node requires preceding UIE output");
                }
                currentResult = DataTransformer.transform(currentResult, transform.getConfig());
            } else if (node instanceof ConnectorNode connector) {
                ConnectorNodeConfig config = connector.getConfig();
                if (config != null && "http".equals(config.getType()) && config.getUrl() != null && !config.getUrl().isBlank()) {
                    callHttpConnector(config, currentResult);
                }
            } else if (node instanceof OutputNode) {
                break;
            }

            currentNodeId = findNextNodeId(edges, currentNodeId);
        }

        return currentResult;
    }

    private String findInputNodeId(List<WorkflowNode> nodes) {
        return nodes.stream()
                .filter(n -> n instanceof InputNode)
                .map(WorkflowNode::getId)
                .findFirst()
                .orElse(null);
    }

    private String findNextNodeId(List<WorkflowEdge> edges, String sourceId) {
        if (sourceId == null) return null;
        return edges.stream()
                .filter(e -> sourceId.equals(e.getSourceNodeId()))
                .map(WorkflowEdge::getTargetNodeId)
                .findFirst()
                .orElse(null);
    }

    private Object callUieApi(UieNodeConfig config, MultipartFile file) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (config.getFormFields() != null) {
            config.getFormFields().forEach(body::add);
        }

        if (file != null && !file.isEmpty()) {
            String fieldName = config.getFileFieldName() != null ? config.getFileFieldName() : "file";
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
                }
            };
            body.add(fieldName, resource);
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        String method = config.getMethod() != null ? config.getMethod().toUpperCase() : "POST";

        ResponseEntity<String> response = restTemplate.exchange(
                config.getUrl(),
                HttpMethod.valueOf(method),
                request,
                String.class
        );

        return response.getBody();
    }

    private void callHttpConnector(ConnectorNodeConfig config, Object body) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (config.getHeaders() != null) {
            config.getHeaders().forEach(headers::set);
        }
        String json = body instanceof String s ? s : new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body);
        HttpEntity<String> request = new HttpEntity<>(json, headers);
        String method = config.getMethod() != null ? config.getMethod().toUpperCase() : "POST";
        restTemplate.exchange(config.getUrl(), HttpMethod.valueOf(method), request, String.class);
    }
}
