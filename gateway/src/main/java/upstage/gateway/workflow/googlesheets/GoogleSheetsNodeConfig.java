package upstage.gateway.workflow.googlesheets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleSheetsNodeConfig {

    /** Google Sheets API endpoint or Apps Script web app URL */
    private String webhookUrl;

    /** Sheet name to append to */
    private String sheetName = "Sheet1";

    /** Column mapping: which fields go to which columns (ordered) */
    private List<String> columnKeys;

    /** Whether to include a header row on first write */
    private boolean includeHeader = true;
}
