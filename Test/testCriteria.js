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
    }
    runScoreTest(){
        const needCoaching = [], noCoaching = [];
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
                needCoaching.push({rowIndex:i+7589,severity,categories});
            }else{
                noCoaching.push({rowIndex:i+7589,severity,categories});
            }
        });
        Logger.log("Need Coaching: %s",needCoaching);
        Logger.log("No Coaching: %s",noCoaching);

        const scoreSheet = this.ss.getSheetByName("Score_Test");
        const scoreNeedCoaching = new Set(
          scoreSheet.getSheetValues(1,1,scoreSheet.getLastRow(),scoreSheet.getLastColumn())[0]
        );
        noCoaching.forEach(el => {
          if(scoreNeedCoaching.has(el.rowIndex)){
            Logger.log("Score Test Failed: %s",el.rowIndex);
            throw new Error("test failed");
          }else{
            Logger.log("rowIndex: %s, passed test",el.rowIndex);
          }
        });  
    }
}

function testScore(){
    new TestCriteria().runScoreTest();
}