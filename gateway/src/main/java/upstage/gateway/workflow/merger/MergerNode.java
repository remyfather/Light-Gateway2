package upstage.gateway.workflow.merger;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MergerNode extends WorkflowNode {

    private MergerNodeConfig config;

    public MergerNode(String id, String label, double positionX, double positionY, MergerNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
