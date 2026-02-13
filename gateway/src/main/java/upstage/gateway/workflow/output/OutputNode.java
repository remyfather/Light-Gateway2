package upstage.gateway.workflow.output;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class OutputNode extends WorkflowNode {

    public OutputNode(String id, String label, double positionX, double positionY) {
        super(id, label, positionX, positionY);
    }
}
