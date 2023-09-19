class TestManagementEmails extends TestCoachingRow{
    constructor() {
        super(); // Call the parent class constructor
    }

    runTestManagementEmail(howMany = -10) {
        this.filterForCoachings();
        this.formattedRows = this.formattedRows ? this.formattedRows : this.formatCoachingRows();
        const lastHowMany = formattedRows.slice(howMany);
        const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind(this)
        lastHowMany.forEach((row, index) => {
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

class TestHttpRequest extends TestCoachingRow{
    constructor(){
        super();
    }

    runTestHttpRequest(howMany = -10){
        this.filterForCoachings();
        this.formattedRows = this.formattedRows ? this.formattedRows : this.formatCoachingRows();
        const lastHowMany = this.formattedRows.slice(howMany);

        lastHowMany.forEach((row, index) => {
            const requestOptions = {
                method: 'post',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
                }
            };
            requestOptions["payload"] = JSON.stringify(row.coachingRow); // prepare for request
            sendHttpWIthRetry("https://script.google.com/a/macros/shift4.com/s/AKfycbzVwcCdBlPVyTrjXjd0aPTf_iWYe9tJLCTPhUHGqA7FQ-ownSx0ZIKz6Ovkgl_WQw8lTA/exec",this.requestOptions);
        });
    }
}