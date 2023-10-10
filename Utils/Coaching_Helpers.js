const mkDescribeText = function (evalRow,colMap,score){
    return `Evaluator: ${evalRow[colMap.get(EVALUATOR_HEADER)]}
    Transcript URL: ${transformTranscriptIds(evalRow[colMap.get(TRANSCRIPT_ID_HEADER)]).map(el => el.href).join(",\n")}
    Score: ${convertScoreFormat(score)}
    Ticket#: ${evalRow[colMap.get(TICKET_HEADER)]}
    Agent's Name: ${evalRow[colMap.get(AGENT_NAME_HEADER)]}
    ${IS_CALL == "true" ? `MID & DBA Name:  ${evalRow[colMap.get(MID_DBA_HEADER)]}` : ""}
    `
}
const cache = CacheService.getScriptCache();
const getTeams = Custom_Utilities.memoize((REPORTING_ID) => Custom_Utilities.exponentialBackoff(() => CoachingRequestScripts.getTeams(REPORTING_ID)), cache);

const getHttp = function (team, cache) {
    
    const teams = getTeams(REPORTING_ID);
    if(typeof team !== "string") throw new Error("Team entered was not a string in getHttp function");
    team = team.toLowerCase(); // Convert the input team to lowercase

    for (let i = 0; i < teams.length; i++) {
        if (teams[i].values[0].map(value => typeof value === "string" ? value.toLowerCase(): value).includes(team)) { // Convert each value to lowercase before checking
            return teams[i].values[0][2]; // replace this with web app url
        }
    }
    throw new Error("Team is not on Operation Coaching Master Sheet");
};

const formatAsCoachingRow = function(evalRow,colMap, agentObj,severity,categories,score){
    const row = new Array(11);
    
    row[this.coachingHeaders["Timestamp"]] = evalRow[colMap.get("Timestamp")];
    row[this.coachingHeaders["Agent's Name"]] = agentObj["Employee Name"];
    row[this.coachingHeaders["Supervisor"]] = agentObj["SUPERVISOR"];
    row[this.coachingHeaders["Email Address"]] = agentObj["Email Address"]; //submitter
    row[this.coachingHeaders["Coaching Identifier?"]] = evalRow[colMap.get(TRANSCRIPT_ID_HEADER)];
    const ticketNumber = evalRow[colMap.get(TICKET_HEADER)];
    row[this.coachingHeaders["Ticket Link"]] = CoachingRequestScripts.getTicketNumber(
        evalRow[colMap.get(TICKET_HEADER)],
        ticketNumber && /\d{7}/.test(ticketNumber)
    );
    row[this.coachingHeaders["Severity?"]] = severity; //because they want these processed with 24hrs
    row[this.coachingHeaders["Category?"]] = categories;
    row[this.coachingHeaders["Describe?"]] = mkDescribeText(evalRow,colMap,score);
    return row;
}

function writeToSheetA1Notation(A1Notation,value){
    const range = this.responseSheet.getRange(A1Notation);
    range.setValue(value);
}