package upstage.gateway.workflow.execution;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExecutionHistoryService {

    private final Map<String, ExecutionContext> executions = new ConcurrentHashMap<>();

    public ExecutionContext create(String requestId, String workflowId, int totalFiles) {
        ExecutionContext ctx = ExecutionContext.start(requestId, workflowId, totalFiles);
        executions.put(ctx.getRequestId(), ctx);
        return ctx;
    }

    public Optional<ExecutionContext> findByRequestId(String requestId) {
        return Optional.ofNullable(executions.get(requestId));
    }

    public List<ExecutionContext> findAll() {
        return new ArrayList<>(executions.values());
    }

    public List<ExecutionContext> findByWorkflowId(String workflowId) {
        return executions.values().stream()
                .filter(ctx -> workflowId.equals(ctx.getWorkflowId()))
                .sorted(Comparator.comparing(ExecutionContext::getStartTime).reversed())
                .toList();
    }
}
