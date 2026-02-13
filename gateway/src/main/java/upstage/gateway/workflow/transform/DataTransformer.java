package upstage.gateway.workflow.transform;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parse 출력을 기업 포맷으로 변환
 * 1) fieldMappings: sourceKey → targetPath (점 표기로 중첩 객체 생성)
 * 2) outputTemplate: {{key}} 형식 치환 (폴백)
 */
public class DataTransformer {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{([^}]+)}}");

    public static Object transform(Object input, TransformNodeConfig config) throws Exception {
        if (config == null) {
            return input;
        }

        List<FieldMapping> mappings = config.getFieldMappings();
        if (mappings != null && !mappings.isEmpty()) {
            return transformByMappings(input, mappings);
        }

        if (config.getOutputTemplate() != null && !config.getOutputTemplate().isBlank()) {
            return transformByTemplate(input, config.getOutputTemplate());
        }

        return input;
    }

    /** fieldMappings 기반 변환 - targetPath에 따라 중첩 객체 생성 */
    private static Object transformByMappings(Object input, List<FieldMapping> mappings) throws Exception {
        Map<String, Object> data;
        if (input instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = (Map<String, Object>) input;
            data = m;
        } else {
            String json = input instanceof String s ? s : MAPPER.writeValueAsString(input);
            data = MAPPER.readValue(json, Map.class);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        for (FieldMapping m : mappings) {
            if (m.getSourceKey() == null || m.getTargetPath() == null) continue;
            Object value = data.get(m.getSourceKey());
            if (value == null && data.containsKey("fields")) {
                Object fieldsObj = data.get("fields");
                if (fieldsObj instanceof List<?> list) {
                    for (Object f : list) {
                        if (f instanceof Map) {
                            Map<?, ?> fieldMap = (Map<?, ?>) f;
                            Object k = fieldMap.get("key");
                            if (m.getSourceKey().equals(k != null ? k.toString() : null)) {
                                value = fieldMap.get("refinedValue");
                                if (value == null) value = fieldMap.get("value");
                                break;
                            }
                        }
                    }
                }
            }
            setNested(result, m.getTargetPath(), value);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private static void setNested(Map<String, Object> root, String path, Object value) {
        String[] parts = path.split("\\.", -1);
        Map<String, Object> current = root;
        for (int i = 0; i < parts.length - 1; i++) {
            String key = parts[i];
            current = (Map<String, Object>) current.computeIfAbsent(key, k -> new LinkedHashMap<>());
        }
        current.put(parts[parts.length - 1], value);
    }

    private static Object transformByTemplate(Object input, String template) throws Exception {
        Map<String, Object> data;
        if (input instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = (Map<String, Object>) input;
            data = m;
        } else {
            String json = input instanceof String s ? s : MAPPER.writeValueAsString(input);
            data = MAPPER.readValue(json, Map.class);
        }

        Map<String, String> flat = data.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue() != null ? e.getValue().toString() : ""
                ));
        if (data.containsKey("fields") && data.get("fields") instanceof List<?> list) {
            for (Object f : list) {
                if (f instanceof Map) {
                    Map<?, ?> fieldMap = (Map<?, ?>) f;
                    Object k = fieldMap.get("key");
                    Object v = fieldMap.get("refinedValue");
                    if (v == null) v = fieldMap.get("value");
                    if (k != null) flat.put(k.toString(), v != null ? v.toString() : "");
                }
            }
        }

        Matcher m = PLACEHOLDER.matcher(template);
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            String key = m.group(1).trim();
            String replacement = flat.getOrDefault(key, "");
            replacement = replacement.replace("\\", "\\\\").replace("\"", "\\\"");
            m.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        m.appendTail(sb);

        return MAPPER.readValue(sb.toString(), Object.class);
    }
}
