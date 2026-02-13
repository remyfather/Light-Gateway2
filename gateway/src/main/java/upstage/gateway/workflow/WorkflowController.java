package upstage.gateway.workflow;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import upstage.gateway.workflow.model.Workflow;

import java.util.List;

@RestController
@RequestMapping("/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final WorkflowExecutionService executionService;

    public WorkflowController(WorkflowService workflowService, WorkflowExecutionService executionService) {
        this.workflowService = workflowService;
        this.executionService = executionService;
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

    @PostMapping(value = "/{id}/execute", consumes = "multipart/form-data")
    public ResponseEntity<?> execute(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return executionService.execute(id, file);
    }

    /**
     * 미리보기 실행 - UIE 노드까지 실행(호출+파싱) 후 결과 반환 (Transform 매핑 설정용)
     */
    @PostMapping(value = "/{id}/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> preview(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return executionService.preview(id, file);
    }

}
