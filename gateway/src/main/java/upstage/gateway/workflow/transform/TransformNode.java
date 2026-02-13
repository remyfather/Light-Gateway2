package upstage.gateway.workflow.transform;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TransformNode extends WorkflowNode {

    private TransformNodeConfig config;

    public TransformNode(String id, String label, double positionX, double positionY, TransformNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
