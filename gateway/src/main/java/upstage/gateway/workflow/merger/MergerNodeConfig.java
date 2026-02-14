package upstage.gateway.workflow.merger;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MergerNodeConfig {

    /** Merge strategy: "array", "flat_merge", "grouped" */
    private String strategy = "array";

    /** Group key for "grouped" strategy - groups results by this field */
    private String groupByKey;

    /** Whether to include file metadata (filename, index) in each result */
    private boolean includeFileMetadata = true;
}
