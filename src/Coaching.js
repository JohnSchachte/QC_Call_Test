/**
 * @param {*} e - event object from trigger
 * @returns {void} 
 */
function initializeAlertAndCoachingOnLowScore(e){
    Custom_Utilities.deleteSelfTrigger(ScriptApp,e.triggerUid);
    const cache = CacheService.getScriptCache();
    const cacheValue = cache.get(e.triggerUid);
    if(!cacheValue){
        Logger.log("No cache value found");
        Gmail.sendEmail("jscahchte@shift4.com,pi@shift4.com","No cache value found","No cache value found. Script Id: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk");
        return;
    }
    const {row,agentObj,score,updateValues,rowIndex} = JSON.parse(cacheValue);
    alertAndCoachOnLowScore(row,agentObj,score,updateValues,rowIndex);

}
function alertAndCoachOnLowScore(row,agentObj,score,rowIndex){

    /**TODO:
     * 1. get column map - done and tested
     * 2. ensure agent is apart of the coaching process - done and tested
     * 4. assign categories based on On Demand Coaching Form - done and tested
     * 5. Assign severities based on JIRA TICKET: https://shift4.atlassian.net/browse/PIP-821 - done and tested
     * 3. setup coaching row - done and tested
     * 4. send to coaching sheet endpoint - determination done and tested
     * 5. send email to supervisor,manager - done and tested
     * 6. write back to the sheet in "Copied to coaching form? And when" - working
     */

    //writeToSheet Decorator
    const responseSheet = SpreadsheetApp.openById(REPORTING_ID).getSheetByName(RESPONSE_SHEET_NAME);
    const writeCoachingStatus = writeToSheetA1Notation.bind({sheet});
    const a1Notation = Custom_Utilities.columnToLetter(colMap.get(COACHING_STATUS_HEADER)+1)+rowIndex.toString(); //Used to write to sheet.
    const colMap = getColMap();
    if(!OperationCoachingMembers.isInEmailSet(agentObj["Email Address"].toLowerCase())){
        /** TODO
         * 1. write to sheet in column "Copied to coaching form? And when"
         */
        
        writeCoachingStatus(a1Notation,"Not in Coaching Process. Timestamp: " + new Date().toLocaleString());
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com","Agent Not in Coaching Process: " + agentObj["Employee Name"],"Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(agentObj));
        return false;
    }
    
    // passed test of 632 rows of data
    const {severity,categories} = determineCoachingNeed(row,colMap,score);
    if(!severity){
        /**TODO
         * 1. write to sheet in column "Copied to coaching form? And when" as not added or something.
         */
        writeCoachingStatus(a1Notation,"No Coaching needed. Timestamp: " + new Date().toLocaleString());
        return false;
    }
    const cache = CacheService.getScriptCache();
    const memoizedGetHttp = Custom_Utilities.memoize(getHttp,cache);
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
    const coachingRow = formatAsCoachingRow(row,colMap,agentObj,severity,categories).bind({coachingHeaders});
    
    const requestOptions = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
        },
    };
    
    const endPoint = memoizedGetHttp(agentObj["Team"],cache);

    requestOptions["payload"] = JSON.stringify(coachingRow); // prepare for request

    let response;
    const failureFunc = () => {
        // Assumption that is the response can't be JSON.parse() that there was an error.
        Logger.log("Row: %s was NOT appended to a coaching backend sheet",rowIndex);
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com","Coaching Request Failure for Row: " + rowIndex,"Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(coachingRow));
        writeCoachingStatus(a1Notation,`HTTP FAILURE. REACH OUT OT PI.\n Timestamp: ${new Date().toLocaleString()}`);
        throw new Error("Row: " + rowIndex + " was NOT appended to a coaching backend sheet");
    }
    try{
        response = retry(() => sendHttpWIthRetry(endPoint,requestOptions));
    }catch(f){
        Logger.log(f);
        failureFunc();
    }
    const coachingId = response["id"];
    if(coachingId){
        /**TODO
         * 1. write to sheet in column "Copied to coaching form? And when" as added or something.
         */
        writeCoachingStatus(a1Notation,`Coaching Id: ${coachingId}\n Timestamp: ${new Date().toLocaleString()}`);
        return true;
    }else{
        failureFunc();
    }

    // sendManagement Email
    const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind({coachingHeaders})
    sendManagementCoachingEmailBound(coachingRow,agentObj,coachingId);

    return result; // return denied or stopped
}

function sendHttpWIthRetry(endPoint,requestOptions){
    const response = UrlFetchApp.fetch(endPoint,requestOptions);
    Logger.log(response.getContentText())
    return JSON.parse(response.getContentText()); // this is what will actually trigger the error. NOT the line above
}

function sendManagementCoachingEmail(coachingRow,agentObject,coachingId="test22"){
        if(!agentObject){
            return;
        }

        const cache = CacheService.getScriptCache();
        const getTeams = Custom_Utilities.memoize(() => CoachingRequestScripts.getTeams(REPORTING_ID), cache);
        // const coachingHeaders = {
        //     "Request Id" : 0,
        //     "Timestamp" : 1,
        //     "Agent's Name" : 2,
        //     "Supervisor" : 3,
        //     "Email Address" : 4,
        //     "Coaching Identifier?" : 5,
        //     "Ticket Link" :6,
        //     "Severity?":7,
        //     "Category?":8,
        //     "Describe?":9
        // };
        // for template vars
        Logger.log(CoachingRequestScripts.getSupCoachingSheet(getTeams(),agentObject));
        Logger.log(coachingId)
        const vars = {
            agentName : agentObject["Employee Name"],
            coachingId,
            supSheet : CoachingRequestScripts.getSupCoachingSheet(getTeams(),agentObject),
            transcriptIds :  transformTranscriptIds(coachingRow[this.coachingHeaders["Coaching Identifier?"]]),
            ticket : coachingRow[this.coachingHeaders["Ticket Link"]] == "No Ticket" ?
            [coachingRow[this.coachingHeaders["Ticket Link"]]] :
            coachingRow[this.coachingHeaders["Ticket Link"]].match(/\d{7}/g).map(el => {return {"id" : el, "url" : "https://tickets.shift4.com/#/tickets/"+el}}),
            severity : coachingRow[this.coachingHeaders["Severity?"]],
            reason : coachingRow[this.coachingHeaders["Category?"]],
            description : coachingRow[this.coachingHeaders["Describe?"]],
            agentEmail : agentObject["Email Address"]
        };
        
        const template = HtmlService.createTemplateFromFile("HTML/agent_coaching");
        template.vars = vars;

        // sendEmail("jschachte@shift4.com","Agent Evaluation Dispute: " + agentObject["Employee Name"],template);
        sendEmail(CoachingRequestScripts.getEmails(agentObject),"Evaluation Coaching: " + agentObject["Employee Name"],template);
}