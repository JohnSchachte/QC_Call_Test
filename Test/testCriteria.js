class TestCriteria{
    constructor(){
        this.colMap = getColMap();
        this.ss = SpreadsheetApp.openById(BACKEND_ID_TEST);
        this.sheet = this.ss.getSheetByName(SUBMISSION_SHEET_NAME);
        this.testRows = this.sheet.getRange(7589,1,this.sheet.getLastRow(),this.sheet.getLastColumn()).getValues();

    }
    runTest(){
        const needCoaching = [], noCoaching = [];
        this.testRows.forEach((row,i) => {
            let score = row[colMap.get(SCORE_HEADER)];
            score = updateScoreValues(row,this.colMap,score);
            let {severity,categories} = determineCoachingNeed(row,this.colMap,score);
            if(severity){
                needCoaching.push({rowIndex:i,severity,categories});
            }else{
                noCoaching.push({rowIndex:i,severity,categories});
            }
        });
        const scoreSheet = this.ss.getSheetByName("Score_Test");
        const scoreNeedCoaching = scoreSheet.getSheetValues(1,1,scoreSheet.getLastRow(),scoreSheet.getLastColumn());
        Logger.log("Need Coaching: ",needCoaching);
        Logger.log("No Coaching: ",noCoaching);
    }

    
}