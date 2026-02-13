package upstage.gateway.workflow.transform;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldMapping {

    /** Parse 출력의 source key */
    private String sourceKey;

    /** 타겟 경로 (점 표기, e.g. spec.cpu, metadata.source) */
    private String targetPath;
}
