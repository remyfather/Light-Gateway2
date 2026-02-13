package upstage.gateway.workflow;

import org.springframework.stereotype.Service;
import upstage.gateway.workflow.model.Workflow;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WorkflowService {

    private final Map<String, Workflow> store = new ConcurrentHashMap<>();

    public List<Workflow> findAll() {
        return List.copyOf(store.values());
    }

    public Optional<Workflow> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Workflow save(Workflow workflow) {
        if (workflow.getId() == null || workflow.getId().isBlank()) {
            workflow.setId("wf-" + System.currentTimeMillis());
        }
        store.put(workflow.getId(), workflow);
        return workflow;
    }

    public boolean deleteById(String id) {
        return store.remove(id) != null;
    }
}
