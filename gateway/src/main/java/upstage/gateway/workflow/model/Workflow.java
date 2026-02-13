package upstage.gateway.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Workflow {

    private String id;
    private String name;
    private List<WorkflowNode> nodes;
    private List<WorkflowEdge> edges;
}
