class Tester {
    constructor() {
        this.colMap = getColMapTest();
        this.ss = SpreadsheetApp.openById(BACKEND_ID_TEST);
        this.sheet = this.ss.getSheetByName(SUBMISSION_SHEET_NAME.replace(/\'/g,""));
        this.testRows = Sheets.Spreadsheets.Values.get(BACKEND_ID_TEST,`${SUBMISSION_SHEET_NAME}!A${7589}:BZ`)
          .values;
    }

    getCoachingSets(columns) {
        return columns.map(col => {
            return new Set(
                this.testSheet.getSheetValues(1, col, this.testSheet.getLastRow(), 1).map(el => el[0])
            );
        });
    }
}