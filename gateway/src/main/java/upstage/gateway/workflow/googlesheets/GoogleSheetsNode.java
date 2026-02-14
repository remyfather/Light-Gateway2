package upstage.gateway.workflow.googlesheets;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import upstage.gateway.workflow.model.WorkflowNode;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class GoogleSheetsNode extends WorkflowNode {

    private GoogleSheetsNodeConfig config;

    public GoogleSheetsNode(String id, String label, double positionX, double positionY, GoogleSheetsNodeConfig config) {
        super(id, label, positionX, positionY);
        this.config = config;
    }
}
