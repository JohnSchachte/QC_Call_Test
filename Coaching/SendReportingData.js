/**
 *
 *
 * @param {*} row
 * @param {*} colMap
 * @param {*} categories
 */
function transformReliabilityReporting(row,colMap,categories,rowIndex,reportingColMap,agentObj){
    /**
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
     * Row Index
     * Coaching Sent Timestamp
     * Coaching Sent To  
    */
   
    const transFormedRow = new Array(12);
    let colMapString = "";
    colMapString = "";
    reportingColMap.forEach((value,key) => colMapString += `${key} : ${value} \n` );
    transFormedRow[reportingColMap.get("Evaluator")] = row[colMap.get(EVALUATOR_HEADER)];
     
    transFormedRow[reportingColMap.get("Date Scored:")] = row[colMap.get(TIMESTAMP_HEADER)];
    transFormedRow[reportingColMap.get("Scored Month, Year")] = row[colMap.get(TIMESTAMP_HEADER)]
    transFormedRow[reportingColMap.get("Agent's Name")] = row[colMap.get(AGENT_NAME_HEADER)];
    transFormedRow[reportingColMap.get("Agent's Team")] = agentObj["Team"];
    transFormedRow[reportingColMap.get("Record ID/Chat line # w/hyperlink")] =  transformTranscriptIds(row[colMap.get(TRANSCRIPT_ID_HEADER)]).map(({href}) => href).join(",\n");
    transFormedRow[reportingColMap.get("Score")] = calculateScore(row[colMap.get(SCORE_HEADER)]);
    
    let ticketNumber = row[colMap.get(TICKET_HEADER)];
    transFormedRow[reportingColMap.get("Ticket# w/HyperLink")] = ((/\d{7}/g).test(ticketNumber) ? ticketNumber.match((/\d{7}/g)).map(el => {return "https://tickets.shift4.com/#/tickets/"+el}) : ["No Ticket Link"]).join(",\n");
    
    transFormedRow[reportingColMap.get("Below 75%")] = categories.includes("Scored Below 75%");
    
    transFormedRow[reportingColMap.get("Ticket Handling(3 or more)")] = categories.includes("Ticket Handling");
    
    transFormedRow[reportingColMap.get("Security Violation")] = categories.includes("Security Violation");
    
    transFormedRow[reportingColMap.get("No Ticket Filed/Documents")] = categories.includes("No ticket filed/documented");
    
    transFormedRow[reportingColMap.get("Work Avoidance")] = categories.includes("Work Avoidance");
    
    transFormedRow[reportingColMap.get("Row Index")] = rowIndex;

    transFormedRow[reportingColMap.get("Coaching Sent Timestamp")] = new Date().toLocaleString();
    transFormedRow[reportingColMap.get("Coaching Sent To")] =  (agentObj["Sup_Email"] || agentObj["Manager_Email"] || "");
    Logger.log("reportRow = %s",transFormedRow);
    
    return transFormedRow;
}

function sendReportingData(row,colMap,categories,rowIndex,agentObj){

    const reportingColMap = getReportingColMap();
    const reportingRow = transformReliabilityReporting(row,colMap,categories,rowIndex,reportingColMap,agentObj);
    
    const ss = SpreadsheetApp.openById(scriptPropsObj["REPORTING_SS_ID"]);
    const reportingSheet = ss.getSheetByName(scriptPropsObj["REPORTING_SHEET_NAME"]);

    
    const lock = LockService.getScriptLock();
    lock.waitLock(LOCK_WAIT_TIME);
    reportingSheet.appendRow(reportingRow);
    lock.releaseLock();

}

function getReportingColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(scriptPropsObj["REPORTING_SS_ID"],`${scriptPropsObj["REPORTING_SHEET_NAME"]}!1:1`,{majorDimension:"ROWS"}).values[0]);
}