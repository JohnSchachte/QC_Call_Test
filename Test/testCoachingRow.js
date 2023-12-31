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
        this.filterForCoachings();
        const formattedRows = this.formatCoachingRows();
        
        formattedRows.forEach((row, index) => {
            const slicedRow = row.slice(1);
            Logger.log("describe element is %s",row[this.coachingHeaders["Describe?"]])       
            if (slicedRow.some(el => !el) || (/undefined|null/.test(row[this.coachingHeaders["Describe?"]]))) {
                Logger.log(`Failed to format row at index: ${index + 1}`); // +1 because arrays are 0-indexed
                Logger.log("%s is: ",index);
                // const coachingHeaders = Object.keys(this.coachingHeaders);
                // row.forEach((el,index)=> Logger.log(`${coachingHeaders[index]} is ${el}`));
                Logger.log("Value after 'Describe?': %s", row[this.coachingHeaders["Describe?"]]);
                const describeValue = row[this.coachingHeaders["Describe?"] - 1];
                if (/undefined/.test(describeValue)) {
                    Logger.log("Failure due to 'undefined' in 'Describe?' field.");
                }
                
                if (/null/.test(describeValue)) {
                    Logger.log("Failure due to 'null' in 'Describe?' field.");
                }
                  slicedRow.forEach((el, index) => {
                      if (!el) {
                          Logger.log(`Failure at index ${index + 1} due to value: ${el}`);
                      }
                  });
                throw new Error(`Failed to format row at index: ${index + 1}`);

            }
            Logger.log("%s is %s.",index,row)
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
                if(!agentObj){
                  Logger.log("%s produced a null agentObj. Please research.",row[this.colMap.get(AGENT_NAME_HEADER)]); // there were 4 and these employees were found on former employee sheet
                  return;
                }
                this.needCoaching.push({row,agentObj,severity,categories,score});
            }
        });
        Logger.log("Need Coaching: %s",this.needCoaching);
    }
    formatCoachingRows() {
        const formatAsCoachingRowBinded = formatAsCoachingRow.bind(this)
        return this.needCoaching.map(el => {
            return formatAsCoachingRowBinded(el.row,this.colMap,el.agentObj,el.severity,el.categories,el.score);
        });
    }
}

function testFormatRow(){
  new TestCoachingRow().runCoachingFormatTest();
}