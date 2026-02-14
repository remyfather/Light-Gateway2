package upstage.gateway.workflow.splitter;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SplitterNodeConfig {

    /** Maximum parallel executions (0 = unlimited) */
    private int maxParallel = 0;

    /** Timeout per file in seconds */
    private int timeoutSeconds = 60;
}
