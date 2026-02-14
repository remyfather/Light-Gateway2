package upstage.gateway.workflow;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import upstage.gateway.workflow.model.Workflow;
import upstage.gateway.workflow.execution.ExecutionContext;
import upstage.gateway.workflow.execution.ExecutionHistoryService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final WorkflowExecutionService executionService;
    private final ExecutionHistoryService executionHistory;

    public WorkflowController(WorkflowService workflowService,
                               WorkflowExecutionService executionService,
                               ExecutionHistoryService executionHistory) {
        this.workflowService = workflowService;
        this.executionService = executionService;
        this.executionHistory = executionHistory;
    }

    @GetMapping
    public List<Workflow> list() {
        return workflowService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> get(@PathVariable String id) {
        return workflowService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Workflow create(@RequestBody Workflow workflow) {
        return workflowService.save(workflow);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> update(@PathVariable String id, @RequestBody Workflow workflow) {
        workflow.setId(id);
        return workflowService.findById(id) != null
                ? ResponseEntity.ok(workflowService.save(workflow))
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return workflowService.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    /* ── Single-file execute ── */

    @PostMapping(value = "/{id}/execute", consumes = "multipart/form-data")
    public ResponseEntity<?> execute(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return executionService.execute(id, file);
    }

    /* ── Multi-file batch execute ── */

    @PostMapping(value = "/{id}/execute/batch", consumes = "multipart/form-data")
    public ResponseEntity<?> executeBatch(
            @PathVariable String id,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "requestId", required = false) String requestId) {
        return executionService.executeBatch(id, files, requestId);
    }

    /* ── Preview ── */

    @PostMapping(value = "/{id}/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> preview(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return executionService.preview(id, file);
    }

    /* ── Execution History ── */

    @GetMapping("/executions")
    public List<ExecutionContext> listExecutions() {
        return executionHistory.findAll();
    }

    @GetMapping("/executions/{requestId}")
    public ResponseEntity<ExecutionContext> getExecution(@PathVariable String requestId) {
        return executionHistory.findByRequestId(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/executions")
    public List<ExecutionContext> getWorkflowExecutions(@PathVariable String id) {
        return executionHistory.findByWorkflowId(id);
    }
}
