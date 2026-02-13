package upstage.gateway.workflow.input;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class InputNode extends WorkflowNode {

    public InputNode(String id, String label, double positionX, double positionY) {
        super(id, label, positionX, positionY);
    }
}
