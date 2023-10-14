/**
 * Transforms the given row data into a format suitable for reliability reporting.
 *
 * @param {Array} row - The row data to transform.
 * @param {Map} colMap - A map of column headers to their indices for the row data.
 * @param {Array} categories - The categories associated with the row.
 * @param {number} rowIndex - The index of the row in the original data.
 * @param {Map} reportingColMap - A map of column headers to their indices for the reporting data.
 * @param {Object} agentObj - An object containing agent data.
 * @returns {Array} The transformed row data.
 */
function transformReliabilityReporting(row, colMap, categories, rowIndex, reportingColMap, agentObj) {    /**
     * SCHEMA DEFINITION FOR THIS TABLE:
     * Evaluator
     * Date Scored:
     * Scored Month, Year
     * Agent's Name
     * Record ID/Chat line # w/hyperlink
     * Score
     * Ticket# w/Hyperlink
     * Below 75%
     * Ticket handling(3 or more)
     * Security Violation
     * No Ticket Filed/Documents
     * Work Avoidance
     * Call Index
     * Chat Index
     * Coaching Sent Timestamp
     * Coaching Sent To  
    */
   
    const transFormedRow = new Array(12);

    transFormedRow[reportingColMap.get("Evaluator")] = row[colMap.get(EVALUATOR_HEADER)];
     
    const timeStamp = row[colMap.get(TIMESTAMP_HEADER)];
    transFormedRow[reportingColMap.get("Date Scored:")] = timeStamp; 
    const month_date = formatTimestamp_Month_Date(new Date(timeStamp?.replace(/AM|PM|EST/g,"").trim() ?? new Date()));
    transFormedRow[reportingColMap.get("Scored Month, Year")] = month_date;

    transFormedRow[reportingColMap.get("Agent's Name")] = row[colMap.get(AGENT_NAME_HEADER)];
    transFormedRow[reportingColMap.get("Agent's Team")] = agentObj?.Team ?? "WFM Name mismatch";;
    transFormedRow[reportingColMap.get("Record ID/Chat line # w/hyperlink")] =  transformTranscriptIds(row[colMap.get(TRANSCRIPT_ID_HEADER)]).map(({href}) => href).join(",\n");
    transFormedRow[reportingColMap.get("Score")] = calculateScore(row[colMap.get(SCORE_HEADER)]);
    
    let ticketNumber = row[colMap.get(TICKET_HEADER)];
    transFormedRow[reportingColMap.get("Ticket# w/HyperLink")] = ((/\d{7}/g).test(ticketNumber) ? ticketNumber.match((/\d{7}/g)).map(el => {return "https://tickets.shift4.com/#/tickets/"+el}) : ["No Ticket Link"]).join(",\n");
    
    transFormedRow[reportingColMap.get("Below 75%")] = categories.includes("Scored Below 75%");
    
    transFormedRow[reportingColMap.get("Ticket Handling(3 or more)")] = categories.includes("Ticket Handling");
    
    transFormedRow[reportingColMap.get("Security Violation")] = categories.includes("Security Violation");
    
    transFormedRow[reportingColMap.get("No Ticket Filed/Documents")] = categories.includes("No ticket filed/documented");
    
    transFormedRow[reportingColMap.get("Work Avoidance")] = categories.includes("Work Avoidance");
    
    transFormedRow[reportingColMap.get(IS_CALL == "true" ? "Call Index" : "Chat Index")] = rowIndex; // determines what foreign key dependencies is being used Call || Chat

    transFormedRow[reportingColMap.get("Coaching Sent Timestamp")] = new Date().toLocaleString();
    transFormedRow[reportingColMap.get("Coaching Sent To")] =  (agentObj?.Sup_Email || agentObj?.Manager_Email || "");
    Logger.log("reportRow = %s",transFormedRow);
    
    return transFormedRow;
}

/**
 * Appends transformed row data to the reporting sheet.
 *
 * @param {Array} row - The row data to send.
 * @param {Map} colMap - A map of column headers to their indices for the row data.
 * @param {Array} categories - The categories associated with the row.
 * @param {number} rowIndex - The index of the row in the original data.
 * @param {Object} agentObj - An object containing agent data.
 */
function sendReportingData(row,colMap,categories,rowIndex,agentObj){

    const reportingColMap = getReportingColMap();
    const reportingRow = transformReliabilityReporting(row,colMap,categories,rowIndex,reportingColMap,agentObj);
    
    const ss = SpreadsheetApp.openById(scriptPropsObj["REPORTING_SS_ID"]);
    const reportingSheet = ss.getSheetByName(scriptPropsObj["REPORTING_SHEET_NAME"]);

    reportingSheet.appendRow(reportingRow);

}

/**
 * Retrieves a map of column headers to their indices for the reporting data.
 *
 * @returns {Map} A map of column headers to their indices.
 */
function getReportingColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(scriptPropsObj["REPORTING_SS_ID"],`${scriptPropsObj["REPORTING_SHEET_NAME"]}!1:1`,{majorDimension:"ROWS"}).values[0]);
}
