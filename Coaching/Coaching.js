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
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com","No cache value found","No cache value found. Script Id: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk");
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

    try{
      CoachingRequestScripts.getEmails(agentObject)
    }catch(f){
      Logger.log(f);
      writeCoachingStatus(a1Notation,"No Sup or Manager. Tried at " + new Date().toLocaleString());
    }
    
    const {severity,categories} = determineCoachingNeed(row,colMap,score);
    if(!severity){
        Logger.log("Severity is falsy")
        writeCoachingStatus(a1Notation,"No Coaching needed. Timestamp: " + new Date().toLocaleString());
        return false;
    }

    const coachingHeaders = {
        "Request Id" : 0,
        "Timestamp" : 1,
        "Agent's Name" : 2,
        "Supervisor" : 3,
        "Email Address" : 4,
        "Coaching Identifier?" : 5,
        "Ticket Link" :6,
        "Severity?":7,
        "Category?":8,
        "Describe?":9
    };

    const {coachingRow,coachingId} = sendCoachingData(row, colMap, agentObj, severity, categories, rowIndex, a1Notation, writeCoachingStatus,coachingHeaders);
    console.log("coachingRow = %s", coachingRow);
    console.log("coachingId = %s",coachingId);

    // sendManagement Email
    const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind({coachingHeaders})
    sendManagementCoachingEmailBound(coachingRow,agentObj,coachingId);

    sendReportingData(row,colMap,categories,rowIndex,agentObj);

    return; // return denied or stopped
}
