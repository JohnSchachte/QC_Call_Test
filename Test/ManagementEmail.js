class TestManagementEmails extends TestManagementEmails{
    constructor() {
        super(); // Call the parent class constructor
        // this.noCoaching = [];
        // this.needCoaching = [];
        // this.coachingHeaders = {
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
        // }
    }

    runCoachingFormatTest() {
        this.filterForCoachings();
        const formattedRows = this.formatCoachingRows();
        const last10 = formattedRows.slice(-10);
        last10.forEach((row, index) => {
            sendManagementCoachingEmail(...row);
        });
    }
    // filterForCoachings(){
    //     this.testRows.forEach((row,i) => {
    //         // Logger.log(i);
    //         let updateValues = new Array(this.colMap.size);
    //         let score = row[this.colMap.get(SCORE_HEADER)];
    //         // Logger.log("score before transform: %s",score);
    //         score = updateScoreValues(updateValues,this.colMap,score)/10000;
    //         // Logger.log("score after transform: %s",score);

    //         if(!score) return;
    //         let {severity,categories} = determineCoachingNeed(row,this.colMap,score);
    //         if(severity){
    //             const agentObj = NameToWFM.getAgentObj(row[this.colMap.get(AGENT_NAME_HEADER)]);
    //             if(!agentObj){
    //               Logger.log("%s produced a null agentObj. Please research.",row[this.colMap.get(AGENT_NAME_HEADER)]); // there were 4 and these employees were found on former employee sheet
    //               return;
    //             }
    //             this.needCoaching.push({row,agentObj,severity,categories,score});
    //         }
    //     });
    //     Logger.log("Need Coaching: %s",this.needCoaching);
    // }
    formatCoachingRows() {
        const formatAsCoachingRowBinded = formatAsCoachingRow.bind(this)
        return this.needCoaching.map(el => {
            return {coachingRow:formatAsCoachingRowBinded(el.row,this.colMap,el.agentObj,el.severity,el.categories,el.score),agentObject:el.agentObj};
        });
    }
}

function testFormatRow(){
  new TestManagementEmails().runCoachingFormatTest();
}