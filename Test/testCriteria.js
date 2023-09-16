function getColMapTest(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(BACKEND_ID_TEST,`${SUBMISSION_SHEET_NAME}!1:1`,{majorDimension:"ROWS"}).values[0]);
}

function testUpdateScoreValues(){
  const colMap = getColMapTest();
  const updateValues = new Array(colMap.size);
  const score = "176 / 201";
  const updatedScore = updateScoreValues(updateValues, colMap, score);
  const expectedScore = Math.round((score[0] / score[1])*10000);
  
  if(updatedScore !== expectedScore) {
    Logger.log("score was %s. score was supposed to be %s", updatedScore, expectedScore);
    throw new Error();
  };
}

class TestCriteria{
    constructor(){
        this.colMap = getColMapTest();
        this.ss = SpreadsheetApp.openById(BACKEND_ID_TEST);
        this.sheet = this.ss.getSheetByName(SUBMISSION_SHEET_NAME.replace(/\'/g,""));
        this.testRows = Sheets.Spreadsheets.Values.get(BACKEND_ID_TEST,`${SUBMISSION_SHEET_NAME}!A${7589}:BZ`)
          .values
        this.noCoaching = [];
        this.needCoaching = [];
    }
    runScoreTest(){
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
                this.needCoaching.push({rowIndex:i+7589,severity,categories});
            }else{
                this.noCoaching.push({rowIndex:i+7589,severity,categories});
            }
        });
        Logger.log("Need Coaching: %s",this.needCoaching);
        Logger.log("No Coaching: %s",this.noCoaching);
        this.checkNoCoaching(); // passed
        this.checkNeedsCoaching();
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

    getCoachingSets(columns){
      const scoreSheet = this.ss.getSheetByName("Score_Test");
      return columns.map(col => {
        return new Set(
          scoreSheet.getSheetValues(1,col,scoreSheet.getLastRow(),1).map(el => el[0])
        );
      })
    }
}

function testScore(){
    new TestCriteria().runScoreTest();
}