package upstage.gateway.workflow.uie;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UIE API 응답 파싱 - fields 배열을 출력 정의에 따라 변환
 */
public class UieResponseParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @SuppressWarnings("unchecked")
    public static Object parse(String uieResponseJson, UieNodeConfig config) throws Exception {
        Map<String, Object> root = MAPPER.readValue(uieResponseJson, new TypeReference<>() {});

        Object fieldsObj = root.get("fields");
        if (!(fieldsObj instanceof List<?> fieldsList)) {
            return root;
        }

        List<Map<String, Object>> fields = fieldsList.stream()
                .filter(f -> f instanceof Map)
                .map(f -> (Map<String, Object>) f)
                .collect(Collectors.toList());

        if (config == null) {
            return root;
        }

        List<Map<String, Object>> filtered = fields.stream()
                .filter(f -> config.getMinConfidence() == null ||
                        ((Number) f.getOrDefault("confidence", 0)).doubleValue() >= config.getMinConfidence())
                .filter(f -> config.getSelectedKeys() == null || config.getSelectedKeys().isEmpty() ||
                        config.getSelectedKeys().contains(f.get("key")))
                .collect(Collectors.toList());

        String format = config.getOutputFormat() != null ? config.getOutputFormat() : "flat_keyvalue";
        Map<String, String> keyMappings = config.getKeyMappings() != null ? config.getKeyMappings() : Map.of();

        return switch (format) {
            case "flat_keyvalue" -> toFlatKeyValue(filtered, keyMappings);
            case "full" -> root;
            default -> Map.of("fields", applyKeyMappings(filtered, keyMappings));
        };
    }

    private static List<Map<String, Object>> applyKeyMappings(List<Map<String, Object>> fields, Map<String, String> keyMappings) {
        if (keyMappings.isEmpty()) return fields;

        return fields.stream().map(field -> {
            Map<String, Object> copy = new LinkedHashMap<>(field);
            Object key = field.get("key");
            if (key != null && keyMappings.containsKey(key.toString())) {
                copy.put("key", keyMappings.get(key.toString()));
            }
            return copy;
        }).collect(Collectors.toList());
    }

    private static Map<String, Object> toFlatKeyValue(List<Map<String, Object>> fields, Map<String, String> keyMappings) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map<String, Object> f : fields) {
            String key = (String) f.get("key");
            Object value = f.get("refinedValue");
            if (value == null) value = f.get("value");
            String outKey = keyMappings.getOrDefault(key, key);
            result.put(outKey, value);
        }
        return result;
    }
}
