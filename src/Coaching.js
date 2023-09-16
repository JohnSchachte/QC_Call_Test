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
     * 1. get column map - done
     * 2. ensure agent is apart of the coaching process - done
     * 4. assign categories based on On Demand Coaching Form - done
     * 5. Assign severities based on JIRA TICKET: https://shift4.atlassian.net/browse/PIP-821 - done
     * 3. setup coaching row
     * 4. send to coaching sheet endpoint
     * 5. send email to supervisor,manager
     * 6. write back to the sheet in "Copied to coaching form? And when"
     */
    const colMap = getColMap();
    if(!OperationCoachingMembers.isInEmailSet(agentObj["Email Address"].toLowerCase())){
        /** TODO
         * 1. write to sheet in column "Copied to coaching form? And when"
         */
        return false;
    }
    
    // passed test of 632 rows of data
    const {severity,categories} = determineCoachingNeed(row,colMap,score);
    if(!severity){
        /**TODO
         * 1. write to sheet in column "Copied to coaching form? And when" as not added or something.
         */
        return false;
    }

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
        }
    };
    
    const endPoint = memoizedGetHttp(agentObj["Team"],cache);

    requestOptions["payload"] = JSON.stringify(coachingRow); // prepare for request
    
    const response = retry(() => sendHttpWIthRetry(endPoint,requestOptions));
    if(response.hasOwnProperty("id")){
        /**TODO
         * 1. write to sheet in column "Copied to coaching form? And when" as added or something.
         */
        return true;
    }

    // sendManagement Email
    sendManagementCoachingEmail(coachingRow,agentObj);


    return result; // return denied or stopped
}

function sendHttpWIthRetry(endPoint,requestOptions){
    const response = UrlFetchApp.fetch(endPoint,requestOptions);
    return JSON.parse(response.getContentText()); // this is what will actually trigger the error. NOT the line above
}

function sendManagementCoachingEmail(coachingRow,agentObject){
        if(!agentObject){
            return;
        }
        const name = agentObject["Employee Name"].toLowerCase().trim();
        // the check has been performed for the evalId.
        const idObject = getIdObject(formResponse,colMap,evalType,name);
        if(!idObject){
            return;
        }
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
        const vars = {
            agentName : agentObject["Employee Name"],
            id :  transformTranscriptIds(coachingRow[this.coachingHeaders["Coaching Identifier?"]]),
            ticket : coachingRow[this.coachingHeaders["Ticket Link"]] == "No Ticket" ?
            [coachingRow[this.coachingHeaders["Ticket Link"]]] :
            coachingRow[this.coachingHeaders["Ticket Link"]].match(/\d{7}/g).map(el => {return {"id" : el, "url" : "https://tickets.shift4.com/#/tickets/"+el}}),
            severity : coachingRow[this.coachingHeaders["Ticket Link"]],
            reason : coachingRow[this.coachingHeaders["Category?"]],
            description : coachingRow[this.coachingHeaders["Describe?"]],
            agentEmail : formResponse[agentObject["Email Address"]]
        };
        
        const template = HtmlService.createTemplateFromFile("html/agent_coaching");
        template.vars = vars;

        // sendEmail("jschachte@shift4.com","Agent Evaluation Dispute: " + agentObject["Employee Name"],template);
        sendEmail(CoachingRequestScripts.getEmails(agentObject),"Agent Evaluation Dispute: " + agentObject["Employee Name"],template);
}