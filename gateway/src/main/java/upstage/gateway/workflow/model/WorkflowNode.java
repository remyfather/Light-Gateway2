package upstage.gateway.workflow.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = upstage.gateway.workflow.input.InputNode.class, name = "input"),
    @JsonSubTypes.Type(value = upstage.gateway.workflow.uie.UieNode.class, name = "uie"),
    @JsonSubTypes.Type(value = upstage.gateway.workflow.transform.TransformNode.class, name = "transform"),
    @JsonSubTypes.Type(value = upstage.gateway.workflow.connector.ConnectorNode.class, name = "connector"),
    @JsonSubTypes.Type(value = upstage.gateway.workflow.output.OutputNode.class, name = "output")
})
public abstract class WorkflowNode {

    private String id;
    private String label;
    private double positionX;
    private double positionY;
}
