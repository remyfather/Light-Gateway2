package upstage.gateway.workflow.uie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * UIE Node 설정 - HTTP multipart 호출 + 파싱 (Parse 흡수)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UieNodeConfig {

    /** UIE API URL */
    private String url;

    /** HTTP 메서드 (기본 POST) */
    private String method = "POST";

    /** Form 필드 (documentName, version 등) */
    private Map<String, String> formFields;

    /** 파일 필드명 (multipart에서 file 파라미터명) */
    private String fileFieldName = "file";

    /** 파싱: 출력에 포함할 field key 목록 (비어있으면 전체) */
    private List<String> selectedKeys;

    /** 파싱: fields_only, flat_keyvalue, full */
    private String outputFormat = "flat_keyvalue";

    /** 파싱: key 매핑 */
    private Map<String, String> keyMappings;

    /** 파싱: confidence 최소값 필터 */
    private Double minConfidence;
}
