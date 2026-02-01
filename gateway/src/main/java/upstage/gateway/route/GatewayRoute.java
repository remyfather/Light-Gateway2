package upstage.gateway.route;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class GatewayRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        
        // REST 설정 (apiContextPath 제거 - openapi 의존성 없이 시작)
        restConfiguration()
            .component("servlet")
            .bindingMode(org.apache.camel.model.rest.RestBindingMode.json)
            .dataFormatProperty("prettyPrint", "true");

        // Health Check 엔드포인트
        rest("/health")
            .get()
            .to("direct:health");

        from("direct:health")
            .routeId("health-check")
            .setBody(constant("{\"status\": \"UP\", \"service\": \"gateway\"}"));

        // Echo 엔드포인트 (테스트용)
        rest("/echo")
            .post()
            .consumes("application/json")
            .produces("application/json")
            .to("direct:echo");

        from("direct:echo")
            .routeId("echo-route")
            .log("Received: ${body}")
            .setBody(simple("{\"echo\": ${body}, \"timestamp\": \"${date:now:yyyy-MM-dd HH:mm:ss}\"}"));

        // 프록시 예제 - 외부 API로 요청 전달
        rest("/proxy")
            .get("/httpbin")
            .to("direct:proxy-httpbin");

        from("direct:proxy-httpbin")
            .routeId("proxy-httpbin")
            .log("Proxying to httpbin.org")
            .setHeader("CamelHttpMethod", constant("GET"))
            .to("http://httpbin.org/get?bridgeEndpoint=true")
            .convertBodyTo(String.class);
    }
}
