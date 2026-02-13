package upstage.gateway.workflow.uie;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class UieNode extends WorkflowNode {

    private UieNodeConfig config;

    public UieNode(String id, String label, double positionX, double positionY, UieNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
