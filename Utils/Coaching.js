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

    /**
     * 
     * @param {*} row 
     * @param {*} colMap
     * returns {String[]|boolean} - returns false if no coaching is needed 
     */
    const determineCoachingNeed = function (row,colMap){
        let severity;
        const categories = [];
        
        if(score <= SCORE_THRESHOLD){
            severity ="Medium";
            categories.push("Scored Below 75%");
        }
        
        if(row[colMap.get(scriptPropsObj["FILED_TICKET_HEADER"])] === "No"){
            severity = "High";
            categories.push("No ticket filed/documented");
        }

        if(hasThreeTicketStrikes(row,colMap)){
            severity = "High";
            categories.push("Ticket Handling");
        }

        const securiityValue = row[colMap.get(scriptPropsObj["SECURITY_HEADER"])];
        if(securiityValue.toLowerCase().includes("no")){
            severity = "High";
            categories.push("Security Violation");
        }

        const workAvoidanceValue = row[colMap.get(scriptPropsObj["WORK_AVOIDANCE_HEADER"])]?.toLowerCase().trim();
        if(checkWorkAvoidance(workAvoidanceValue)){
            severity = "Immediate attention";
            categories.push("Work Avoidance");
        };
        
        return severity ? {severity,categories: categories.join(",")} : false;
    };
    const {severity,categories} = determineCoachingNeed(row,colMap);

    const getHttp = function (team,cache){
        const getTeams = Custom_Utilities.memoize( () => CoachingRequestScripts.getTeams(REPORTING_ID),cache);
        const teams = getTeams();
        for(let i=0;i<teams.length;i++){
            if(teams[i].values[0].includes(team)){
            return teams[i].values[0][2]; // replace this with web app url
            }
        }
        throw new Error("Team is not on Operation Coaching Master Sheet");
    }

    const memoizedGetHttp = Custom_Utilities.memoize(getHttp,cache);

    const mkCaseArray = function(submitRow,colMap, evalType){
        const row = new Array(11);
        row[1] = submitRow[colMap.get("Timestamp")];
        row[5] = submitRow[colMap.get(evalType === "phone" ? "What is the Id for the Evaluation" : "What is the Chat Id for the Evaluation")];
        const hasTicketNumber = submitRow[colMap.get("Do you have a Ticket Number?")];
        row[6] = CoachingRequestScripts.getTicketNumber(
            submitRow[colMap.get("Ticket Number?")],
            hasTicketNumber && hasTicketNumber.startsWith("Y")
        );
        row[7] = "High"; //because they want these processed with 24hrs
        row[8] = `Evaluation Dispute : ${submitRow[colMap.get("What is your reason for disputing?")]}`; // category field
        row[10] = submitRow[colMap.get("Add any related files you'd like to share")];
        return row;
    }

    const caseArray = this.mkCaseArray(formResponse,colMap,getType(formResponse,colMap));
    
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
    caseArray[2] = agentObject["Employee Name"];
    caseArray[3] = agentObject["SUPERVISOR"];
    caseArray[4] = agentObject["Email Address"]; //submitter
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