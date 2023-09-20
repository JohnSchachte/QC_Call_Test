/**
 * @param {*} e - event object from trigger
 * @returns {void} 
 */
function initializeAlertAndCoaching(e){
    Custom_Utilities.deleteSelfTrigger(e,ScriptApp);
    const cache = CacheService.getScriptCache();
    const cacheValue = cache.get(e.triggerUid);
    if(!cacheValue){
        Logger.log("No cache value found");
        GmailApp.sendEmail("jscahchte@shift4.com,pi@shift4.com","No cache value found","No cache value found. Script Id: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk");
        return;
    }
    const {row,agentObj,score,updateValues,rowIndex} = JSON.parse(cacheValue);
    Logger.log("parameters: %s",{row,agentObj,score,updateValues,rowIndex});
    alertAndCoach(row,agentObj,score,rowIndex);
}

function alertAndCoach(row,agentObj,score,rowIndex){
    Logger.log("alertAndCoach called for row: %s",rowIndex);
    Logger.log("agentObj: %s",JSON.stringify(agentObj));
    Logger.log("score: %s",score);
    Logger.log("row: %s",JSON.stringify(row));
    /**TODO:
     * 1. get column map - done and tested
     * 2. ensure agent is apart of the coaching process - done and tested
     * 4. assign categories based on On Demand Coaching Form - done and tested
     * 5. Assign severities based on JIRA TICKET: https://shift4.atlassian.net/browse/PIP-821 - done and tested
     * 3. setup coaching row - done and tested
     * 4. send to coaching sheet endpoint - determination done and tested
     * 5. send email to supervisor,manager - done and tested
     * 6. write back to the sheet in "Copied to coaching form? And when" - done but not tested
     */

    //writeToSheet Decorator
    const responseSheet = SpreadsheetApp.openById(BACKEND_ID).getSheetByName(RESPONSE_SHEET_NAME);

    const colMap = getColMap();

    const writeCoachingStatus = writeToSheetA1Notation.bind({responseSheet});

    const a1Notation = Custom_Utilities.columnToLetter(colMap.get(COACHING_STATUS_HEADER)+1)+rowIndex.toString(); //Used to write to sheet.
    if(!OperationCoachingMembers.isInEmailSet(agentObj["Email Address"].toLowerCase())){
        writeCoachingStatus(a1Notation,"Agent's Team is Not in Coaching Process. Timestamp: " + new Date().toLocaleString());
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com","Agent Not in Coaching Process: " + agentObj["Employee Name"],"Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(agentObj));
        return false;
    }
    
    const {severity,categories} = determineCoachingNeed(row,colMap,score);
    if(!severity){
        writeCoachingStatus(a1Notation,"No Coaching needed. Timestamp: " + new Date().toLocaleString());
        return false;
    }

    const result = getCoachingData(row, colMap, agentObj, severity, categories, rowIndex, a1Notation);
    console.log(result.coachingRow);
    console.log(result.coachingId);

    // sendManagement Email
    const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind({coachingHeaders})
    sendManagementCoachingEmailBound(coachingRow,agentObj,coachingId);

    sendReportingData(row,colMap,categories,rowIndex);

    return; // return denied or stopped
}
