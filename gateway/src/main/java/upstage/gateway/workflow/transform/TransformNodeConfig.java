package upstage.gateway.workflow.transform;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Transform Node 설정 - Parse 출력을 기업 포맷으로 가공
 * fieldMappings: Source ↔ Target 드래그앤드롭 매핑
 * outputTemplate: JSON 템플릿 (fieldMappings 없을 때 폴백)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransformNodeConfig {

    /**
     * Source key → Target path 매핑 (OSB 스타일)
     */
    private List<FieldMapping> fieldMappings;

    /**
     * JSON 출력 템플릿 (fieldMappings 없을 때 사용)
     * {{key}} 형식으로 입력 필드 치환
     */
    private String outputTemplate;
}
