package upstage.gateway.workflow.splitter;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SplitterNode extends WorkflowNode {

    private SplitterNodeConfig config;

    public SplitterNode(String id, String label, double positionX, double positionY, SplitterNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
