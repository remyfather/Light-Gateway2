package upstage.gateway.workflow.execution;

import lombok.Data;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class ExecutionContext {

    private String requestId;
    private String workflowId;
    private Instant startTime;
    private Instant endTime;
    private String status; // RUNNING, SUCCESS, FAILED
    private String errorMessage;
    private int totalFiles;
    private int processedFiles;

    /** Per-node intermediate results */
    private Map<String, Object> nodeResults = new ConcurrentHashMap<>();

    /** Per-file UIE results (after splitter) */
    private List<Map<String, Object>> fileResults = Collections.synchronizedList(new ArrayList<>());

    /** Final merged result (after merger) */
    private Object mergedResult;

    public static ExecutionContext start(String requestId, String workflowId, int totalFiles) {
        ExecutionContext ctx = new ExecutionContext();
        ctx.setRequestId(requestId != null ? requestId : "req-" + System.currentTimeMillis());
        ctx.setWorkflowId(workflowId);
        ctx.setStartTime(Instant.now());
        ctx.setStatus("RUNNING");
        ctx.setTotalFiles(totalFiles);
        ctx.setProcessedFiles(0);
        return ctx;
    }

    public void markSuccess(Object result) {
        this.mergedResult = result;
        this.status = "SUCCESS";
        this.endTime = Instant.now();
    }

    public void markFailed(String error) {
        this.errorMessage = error;
        this.status = "FAILED";
        this.endTime = Instant.now();
    }

    public synchronized void incrementProcessed() {
        this.processedFiles++;
    }
}
