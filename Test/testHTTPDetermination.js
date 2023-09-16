class TestEndPointsDetermination extends Tester{
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
        this.testSheet = this.ss.getSheetByName("EndPoint_Test");
    }

    runEndPointTest() {
        this.filterForCoachings();
        // const formattedRows = this.formatCoachingRows();
        const https = this.determineHttp();
        const coachingSets = this.getCoachingSets([1, 2, 3, 4]);
        const setNames = ["PS Teams", "CS Teams", "POS Teams", "ISV Teams"];
        const httpsMap = {
            "PS Teams":"https://script.google.com/a/macros/shift4.com/s/AKfycbxh6G6gnWORzb8FFQ5Vlj2lOvBHzxb05TIu1NOfF9bwtSUOmN9brlytlqwEuf60I0XK/exec",
            "CS Teams":"https://script.google.com/a/macros/shift4.com/s/AKfycbz9_sl1lENoN9fWdA9DWZLYeMfUBesej9C4_hGs5kobgcmCSSdXbLkdnHoeoa-rENTT/exec",
            "POS Teams":"https://script.google.com/a/macros/shift4.com/s/AKfycbz2oXiLLysbc-Y4rdLAICzqHORRYdB3XiDjHY33mhW8MW-3dC9Tdb6ikBWLNgsxfuCy/exec",
            "ISV Teams":"https://script.google.com/a/macros/shift4.com/s/AKfycby1R0bH-9Ed427PjT_LQV454kLDIVxMuxw4EWXaCi4-6V49vS4P4G7wwR9AajjRF0bo/exec"
        }
        
        https.forEach(el => {
            coachingSets.forEach((set, index) => {
                const rowIndexNumber = parseFloat(el.rowIndex.replace(/,/g, ''));
                if (set.has(rowIndexNumber) === (el.http === httpsMap[setNames[index]])) {
                    Logger.log("rowIndex: %s, passed %s test", el.rowIndex, setNames[index]);
                } else {
                    Logger.log("http = %s",el.http)
                    Logger.log("rowIndex : %s",el.rowIndex);
                    Logger.log("set has : %s",[...set])
                    Logger.log("set has the row = %s",set.has(el.rowIndex));
                    Logger.log("row's http is the same as the http of the team = %s",(el.http === httpsMap[setNames[index]]))
                    Logger.log("%s Test Failed: %s", setNames[index], el);
                    throw new Error("test failed");
                }
            });
        });
        
    }
    
    determineHttp(){
        const cache = CacheService.getScriptCache();
        const memoizedGetHttp = Custom_Utilities.memoize(getHttp,cache);
        return this.needCoaching.map((el,i) => {
          // Logger.log("on index: %s for http. agentObj: %s",i,el.agentObj)
            return {http: memoizedGetHttp(el.agentObj["Team"],cache),rowIndex: el.rowIndex};
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
                this.needCoaching.push({agentObj,rowIndex:row[this.colMap.get("Row")]});
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

function testEndPoints(){
  new TestEndPointsDetermination().runEndPointTest();
}