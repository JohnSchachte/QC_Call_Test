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

const checkIncludesNo = function (value){
    return value && value.toLowerCase().includes("no");
};

const checkSecuirtyViolation = function (value) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase();
  return !(/^yes|^na/.test(value));
};

const checkScore = function (score){
    return score <= SCORE_THRESHOLD; // there must be a score this has been checked before eval email was sent.
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
            check: () => checkIncludesNo(row[colMap.get(scriptPropsObj["FILED_TICKET_HEADER"])]),
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