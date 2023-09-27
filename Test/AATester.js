class Tester {
    constructor() {
        this.startRow = IS_CALL == "true" ? 7589 : 4347;
        this.colMap = getColMap();
        this.ss = SpreadsheetApp.openById(BACKEND_ID);
        this.sheet = this.ss.getSheetByName(SUBMISSION_SHEET_NAME.replace(/\'/g,""));
        this.testRows = Sheets.Spreadsheets.Values.get(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!A${this.startRow}:${IS_CALL == "true" ? "BZ" : "AI"}`)
          .values;
    }

    getCoachingSets(columns) {
        return columns.map(col => {
            return new Set(
                this.testSheet.getSheetValues(2, col, this.testSheet.getLastRow(), 1).map(el => el[0])
            );
        });
    }
}