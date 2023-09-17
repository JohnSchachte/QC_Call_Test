class TestManagementEmails extends TestCoachingRow{
    constructor() {
        super(); // Call the parent class constructor
    }

    runTestManagementEmail() {
        this.filterForCoachings();
        const formattedRows = this.formatCoachingRows();
        const last10 = formattedRows.slice(-1);
        const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind(this)
        last10.forEach((row, index) => {
            sendManagementCoachingEmailBound(row.coachingRow,row.agentObject);
        });
    }
    formatCoachingRows() {
        const formatAsCoachingRowBinded = formatAsCoachingRow.bind(this)
        return this.needCoaching.map(el => {
            return {coachingRow:formatAsCoachingRowBinded(el.row,this.colMap,el.agentObj,el.severity,el.categories,el.score),agentObject:el.agentObj};
        });
    }
}

function testSendManagementEmail(){
  new TestManagementEmails().runTestManagementEmail();
}

function checkEmailQuota() {
  var remainingQuota = MailApp.getRemainingDailyQuota();
  Logger.log('Remaining email quota: ' + remainingQuota);
}