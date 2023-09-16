const hasThreeTicketStrikes = function (row,colMap){
    let count =0;
    const TICKET_HEADERS = [
        "BUSINESS_INFO_ACCORDINGLY_HEADER",
        "CALLER_NAME_HEADER",
        "CALLER_POSITION_HEADER",
        "CALLER_PHONE_HEADER",
        "CALLER_EMAIL_HEADER",
        "SUBJECT_HEADER",
        "PROBLEM_DESCRIPTION_HEADER",
        "ACTION_PLAN_HEADER",
        "SOLUTION_HEADER",
        "DESCRIPTION_HEADER",
        "INTERNAL_NOTES_HEADER"
    ];

    TICKET_HEADERS.forEach(h => {
        const value = row[colMap.get(scriptPropsObj[h])];
        if(value && value.toLowerCase().includes("no")){
            count++;
        }
    });

    return count >= 3;
};

const checkWorkAvoidance = function (workAvoidanceValue){
    if(typeof workAvoidanceValue !== "string") return false;
    
    const workAvoidanceSubStrings = [
        "answered call on mute",
        "failed to disconnect",
        "placed caller on hold",
        "call disconnected",
        "more than 1 of the above"
    ];

    workAvoidanceValue = workAvoidanceValue.toLowerCase().trim();
    return workAvoidanceSubStrings.some(s => workAvoidanceValue.includes(s));
};

const checkSecuirtyViolation = function (value) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase();
  return !(/^yes|^na/.test(value));
};

const checkScore = function (score){
    return score < SCORE_THRESHOLD; // there must be a score this has been checked before eval email was sent.
};

const checkFiledTicket = function (value){
    return value && value.toLowerCase().includes("no");
};

const determineCoachingNeed = function (row, colMap,score) {
    let severity;
    const categories = [];
    // if we need to adjust criteria. this is the variable is what you should add to.
    const criteria = [
        {
            check: () => checkScore(score),
            severity: "Medium",
            category: "Scored Below 75%"
        },
        {
            check: () => checkFiledTicket(row[colMap.get(scriptPropsObj["FILED_TICKET_HEADER"])]),
            severity: "High",
            category: "No ticket filed/documented"
        },
        {
            check: () => hasThreeTicketStrikes(row, colMap),
            severity: "High",
            category: "Ticket Handling"
        },
        {
            check: () => checkSecuirtyViolation(row[colMap.get(scriptPropsObj["SECURITY_HEADER"])]),
            severity: "High",
            category: "Security Violation"
        },
        {
            check: () => {
                return checkWorkAvoidance(row[colMap.get(scriptPropsObj["WORK_AVOIDANCE_HEADER"])]);
            },
            severity: "Immediate attention",
            category: "Work Avoidance"
        }
    ];

    criteria.forEach(criterion => {
        if (criterion.check()) {
            severity = criterion.severity;
            categories.push(criterion.category);
        }
    });

    return severity ? { severity, categories: categories.join(",") } : false;
};

const mkDescribeText = function (evalRow,colMap,score){
    return `Evaluator: ${evalRow[colMap.get(EVALUATOR_HEADER)]}
    Transcript URL: ${transformTranscriptIds(evalRow[colMap.get(TRANSCRIPT_ID_HEADER)]).join(",")}
    Score: ${score}
    Ticket#: ${evalRow[colMap.get(TICKET_HEADER)]}
    Agent's Name: ${evalRow[colMap.get(AGENT_NAME_HEADER)]}
    MID & DBA Name: ${evalRow[colMap.get(MID_DBA_HEADER)]},
    `
}

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
    row[coachingHeaders["Describe?"]] = mkDescribeText(evalRow,colMap,score);
    return row;
}