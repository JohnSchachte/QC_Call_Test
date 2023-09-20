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
        const emailVars = {
            agentName : agentObject["Employee Name"],
            coachingId,
            supSheet : CoachingRequestScripts.getSupCoachingSheet(getTeams(),agentObject["Team"],agentObject["SUPERVISOR"]),
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
        template.vars = emailVars;

        sendEmail(CoachingRequestScripts.getEmails(agentObject),"Evaluation Coaching: " + agentObject["Employee Name"],template);
    }