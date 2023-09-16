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
function alertAndCoachOnLowScore(row,agentObj,score,updateValues,rowIndex){

    /**TODO:
     * 1. get column map - done
     * 2. ensure agent is apart of the coaching process
     * 4. assign categories based on On Demand Coaching Form
     * 5. Assign severities based on JIRA TICKET: https://shift4.atlassian.net/browse/PIP-821
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
    
    const {severity,categories} = determineCoachingNeed(row,colMap,score);
    if(!severity){
        /**TODO
         * 1. write to sheet in column "Copied to coaching form? And when" as not added or something.
         */
        return false;
    }

    const getHttp = function (team,cache){
        const getTeams = Custom_Utilities.memoize( () => CoachingRequestScripts.getTeams(REPORTING_ID),cache);
        const teams = getTeams();
        for(let i=0;i<teams.length;i++){
            if(teams[i].values[0].includes(team)){
            return teams[i].values[0][2]; // replace this with web app url
            }
        }
        throw new Error("Team is not on Operation Coaching Master Sheet");
    };

    const memoizedGetHttp = Custom_Utilities.memoize(getHttp,cache);

    const mkCaseArray = function(evalRow,colMap, agentObj,severity,categories){
        const row = new Array(11);
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
        }
        
        
        
        
        row[coachingHeaders["Timestamp"]] = evalRow[colMap.get("Timestamp")];
        row[coachingHeaders["Agent's Name"]] = agentObj["Employee Name"];
        row[coachingHeaders["Supervisor"]] = agentObj["SUPERVISOR"];
        row[coachingHeaders["Email Address"]] = agentObj["Email Address"]; //submitter
        row[coachingHeaders["Coaching Identifier?"]] = evalRow[colMap.get(TRANSCRIPT_ID_HEADER)];
        const ticketNumber = evalRow[colMap.get(TICKET_HEADER)];
        row[coachingHeaders["Ticket Link"]] = CoachingRequestScripts.getTicketNumber(
            evalRow[colMap.get(TICKET_HEADER)],
            ticketNumber && /\d{7}/.test(ticketNumber)
        );
        row[coachingHeaders["Severity?"]] = severity; //because they want these processed with 24hrs
        row[coachingHeaders["Category?"]] = categories;
        row[coachingHeaders["Describe?"]] = submitRow[colMap.get("Add any related files you'd like to share")];
        return row;
    }

    const caseArray = this.mkCaseArray(row,colMap,);
    
    const requestOptions = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
        }
    };
    
    //check has been performed for the valid wfm agent;
    // all the things we can do with agentObject
    const agentObject = EmailToWFM.getAgentObj(formResponse[colMap.get("Email Address")]);
    if(!agentObject){
        return;
    }
    
    const endPoint = memoizedGetHttp(agentObject["Team"],cache);

    const name = agentObject["Employee Name"].toLowerCase().trim();
    
    // the check has been performed for the evalId.
    const evalType = getType(formResponse,colMap);
    const idObject = getIdObject(formResponse,colMap,evalType,name);
    if(!idObject){
        return;
    }

    caseArray[9] = this.formatAdditionalComments(formResponse,colMap,idObject[0],idObject[1]); //caseArray is fully complete
    requestOptions["payload"] = JSON.stringify(caseArray); // prepare for request
    const result = this.wait(this.checkCondition.bind(this));
    
    // Logger.log("resultState = %s in %s",result,this.getName());
    if(result === "approved"){
        //appending to backend
        const response = CoachingRequestScripts.fetchWithOAuth(endPoint,requestOptions); //parsed json.
        return response["id"]; // approved
    }
    return result; // return denied or stopped
}