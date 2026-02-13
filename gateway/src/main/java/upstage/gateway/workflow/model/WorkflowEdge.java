package upstage.gateway.workflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEdge {

    private String id;
    private String sourceNodeId;
    private String targetNodeId;
}
