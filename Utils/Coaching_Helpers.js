/**
 * Constructs a description text for the evaluation.
 *
 * @param {Array} evalRow - The evaluation row data.
 * @param {Map} colMap - The mapping of column names to indexes.
 * @param {number} score - The evaluation score.
 * @returns {string} - The constructed description text.
 */
const mkDescribeText = function (evalRow,colMap,score){
    return `Evaluator: ${evalRow[colMap.get(EVALUATOR_HEADER)]}
    Transcript URL: ${transformTranscriptIds(evalRow[colMap.get(TRANSCRIPT_ID_HEADER)]).map(el => el.href).join(",\n")}
    Score: ${convertScoreFormat(score)}
    Ticket#: ${evalRow[colMap.get(TICKET_HEADER)]}
    Agent's Name: ${evalRow[colMap.get(AGENT_NAME_HEADER)]}
    ${IS_CALL == "true" ? `MID & DBA Name:  ${evalRow[colMap.get(MID_DBA_HEADER)]}` : ""}
    `
}
// Cache instance for memoized functions.
const cache = CacheService.getScriptCache();
/**
 * Memoized function to get the list of teams.
 *
 * @param {string} REPORTING_ID - The ID used for reporting.
 * @returns {Array} - List of teams.
*/
const getTeams = Custom_Utilities.memoize((REPORTING_ID) => Custom_Utilities.exponentialBackoff(() => CoachingRequestScripts.getTeams(REPORTING_ID)), cache);

/**
 * Fetches the HTTP URL associated with a team.
 *
 * @param {string} team - The team name.
 * @param {CacheService.Cache} cache - The cache instance to use.
 * @returns {string} - The associated HTTP URL.
 * @throws Will throw an error if the team name is not a string or if the team is not found.
 */
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

/**
 * Formats the evaluation row as a coaching row.
 *
 * @param {Array} evalRow - The evaluation row data.
 * @param {Map} colMap - The mapping of column names to indexes.
 * @param {Object} agentObj - The agent's data.
 * @param {string} severity - The severity level of the evaluation.
 * @param {Array} categories - The list of evaluation categories.
 * @param {number} score - The evaluation score.
 * @returns {Array} - The formatted coaching row.
 */
const formatAsCoachingRow = function(evalRow,colMap, agentObj,severity,categories,score){
    const row = new Array(11);
    
    row[this.coachingHeaders["Timestamp"]] = evalRow[colMap.get("Timestamp")];
    row[this.coachingHeaders["Agent's Name"]] = agentObj["Employee Name"];
    row[this.coachingHeaders["Supervisor"]] = agentObj["SUPERVISOR"];
    row[this.coachingHeaders["Email Address"]] = "ReliabilityManagement@shift4.com"; //submitter
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

