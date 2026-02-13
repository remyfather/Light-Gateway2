package upstage.gateway.workflow.connector;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ConnectorNode extends WorkflowNode {

    private ConnectorNodeConfig config;

    public ConnectorNode(String id, String label, double positionX, double positionY, ConnectorNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
