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
    const workAvoidanceSubStrings = [
        "answered call on mute",
        "failed to disconnect",
        "placed caller on hold",
        "call disconnected",
        "more than 1 of the above"
    ];
    return workAvoidanceSubStrings.some(s => workAvoidanceValue.includes(s));
};