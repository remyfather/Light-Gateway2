package upstage.gateway.workflow.connector;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Connector Node 설정 - 결과를 외부로 전송
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectorNodeConfig {

    /** 커넥터 타입: http */
    private String type = "http";

    /** HTTP URL */
    private String url;

    /** HTTP 메서드 (POST, PUT 등) */
    private String method = "POST";

    /** 추가 헤더 */
    private Map<String, String> headers;
}
