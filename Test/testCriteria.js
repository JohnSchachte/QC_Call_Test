
function testReiliabilityData(){
  new TestReiliabilityData().runTestReiliabilityData();
}

class TestCriteria extends Tester {
    constructor() {
        super(); // Call the parent class constructor
        this.noCoaching = [];
        this.needCoaching = [];
        this.testSheet = this.ss.getSheetByName("Criteria_Test");
    }
    runScoreTest(){
        this.coachingDetermination();
        Logger.log("Need Coaching: %s",this.needCoaching);
        Logger.log("No Coaching: %s",this.noCoaching);
        this.checkNoCoaching(); // passed
        this.checkNeedsCoaching(); // passed
    }

    coachingDetermination(){
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
                this.needCoaching.push({rowIndex:i+this.startRow,severity,categories,row});
            }else{
                this.noCoaching.push({rowIndex:i+this.startRow,severity,categories});
            }
        });
    }

    checkNoCoaching() {
        const coachingSets = this.getCoachingSets([1, 2, 3, 4]);
        const setNames = ["Score Need", "No Ticket Filed", "Work Avoidance", "Security Violation"];
        
        this.noCoaching.forEach(el => {
            coachingSets.forEach((set, index) => {
                if (set.has(el.rowIndex)) {
                    Logger.log("%s Test Failed: %s", setNames[index], el.rowIndex);
                    throw new Error("test failed");
                } else {
                    Logger.log("rowIndex: %s, passed %s test", el.rowIndex, setNames[index]);
                }
            });
        });
    }

  checkNeedsCoaching() {
      const coachingSets = this.getCoachingSets([1, 2, 3, 4]);
      const categories = [
          "Scored Below 75%",
          "No ticket filed/documented",
          "Work Avoidance",
          "Security Violation"
      ];

      this.needCoaching.forEach(el => {
          coachingSets.forEach((set, index) => {
              const category = categories[index];
              if (set.has(el.rowIndex) !== el.categories.includes(category)) {
                  Logger.log("Set has rowIndex: %s", set.has(el.rowIndex));
                  Logger.log("Categories includes %s: %s", category, el.categories.includes(category));
                  Logger.log("%s Test Failed: %s", category, el);
                  throw new Error("test failed");
              } else {
                  Logger.log("rowIndex: %s, passed %s test", el.rowIndex, category);
              }
          });
      });
  }

  checkNeedsCoachingLength(){
    this.coachingDetermination();
    const coachingSets = this.getCoachingSets([1,2,3,4])
    const combinedSet = new Set([...coachingSets[0], ...coachingSets[1], ...coachingSets[2], ...coachingSets[3]].filter(el => el));
    const needCoachingIndices = this.needCoaching.map(el => el.rowIndex);
    const inNeedCoachingNotInSets = this.needCoaching.filter(el => !combinedSet.has(el.rowIndex)).filter(el => !/^Ticket\sHandling$/.test(el["categories"]));
    const inSetsNotInNeedCoaching = [...combinedSet].filter(index => !needCoachingIndices.includes(index));

    Logger.log("In needCoaching but not in sets: %s. Length = %s", inNeedCoachingNotInSets,inNeedCoachingNotInSets.length);
    Logger.log("In sets but not in needCoaching: %s. Length = %s", inSetsNotInNeedCoaching, inSetsNotInNeedCoaching.length);

  }
}

function testScore(){
    // new TestCriteria().runScoreTest();
    new TestCriteria().checkNeedsCoachingLength();
}

class TestReiliabilityData extends TestCriteria{
    constructor(){
        super();
    }

    runTestReiliabilityData(){
        this.coachingDetermination();
        this.needCoaching.forEach((row, index) => {
          const agentObj = NameToWFM.getAgentObj(row.row[this.colMap.get(AGENT_NAME_HEADER)]);
            sendReportingData(row.row,this.colMap,row.categories,row.rowIndex,agentObj)
            Logger.log("index = %s",row.rowIndex);
        });
    }
}