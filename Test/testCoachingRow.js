class TestCoachingRow extends Tester{
    constructor() {
        super(); // Call the parent class constructor
        this.noCoaching = [];
        this.needCoaching = [];
        this.coachingHeaders = {
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
    }

    runCoachingFormatTest() {
        this.determineCoachingNeeded();
        const formattedRows = this.formatCoachingRows();
        
        formattedRows.forEach((row, index) => {
            if (row.slice(1).some(el => !el) || (typeof row[coachingHeaders["Describe?"]] === 'string' && row[coachingHeaders["Describe?"]].includes('undefined'))) {
                Logger.log(`Failed to format row at index: ${index + 1}`); // +1 because arrays are 0-indexed
                throw new Error(`Failed to format row at index: ${index + 1}`);
            }
        });
    }

    filterForCoachings(){
        this.testRows.forEach((row,i) => {
            // Logger.log(i);
            let updateValues = new Array(this.colMap.size);
            let score = row[this.colMap.get(SCORE_HEADER)];
            // Logger.log("score before transform: %s",score);
            score = updateScoreValues(updateValues,this.colMap,score)/10000;
            // Logger.log("score after transform: %s",score);

            if(!score) return;
            let {severity,categories} = determineCoachingNeed(row,this.colMap,score);
            if(severity){
                const agentObj = NameToWFM.getAgentObj(row[this.colMap.get(AGENT_NAME_HEADER)]);
                this.needCoaching.push({row,agentObj,severity,categories});
            }
        });
        Logger.log("Need Coaching: %s",this.needCoaching);
    }
    formatCoachingRows() {
        const formatAsCoachingRow = this.formatCoachingRows.bind(this)
        return this.needCoaching.map(el => {
            return formatAsCoachingRow(el.row,this.colMap,el.agentObj,el.severity,el.categories);
        });
    }

}