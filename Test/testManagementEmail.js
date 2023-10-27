class TestManagementEmails extends TestCoachingRow{
    constructor() {
        super(); // Call the parent class constructor
    }

    runTestManagementEmail(howMany = -1) {
        this.filterForCoachings();
        this.formattedRows = this.formattedRows ? this.formattedRows : this.formatCoachingRows();
        const lastHowMany = this.formattedRows.slice(howMany);
        const sendManagementCoachingEmailBound = sendManagementCoachingEmail.bind(this)
        lastHowMany.forEach((row, index) => {
            const emailArray = DoEmails.mkEmailArray(row.row,this.colMap,(row.score*10000).toFixed(2))
            sendManagementCoachingEmailBound(row.coachingRow,row.agentObject,emailArray);
        });
    }
    formatCoachingRows() {
        const formatAsCoachingRowBinded = formatAsCoachingRow.bind(this)
        return this.needCoaching.map(el => {
            return {row: el.row, score: el.score, coachingRow:formatAsCoachingRowBinded(el.row,this.colMap,el.agentObj,el.severity,el.categories,el.score),agentObject:el.agentObj};
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

class TestHttpRequest extends TestManagementEmails{
    constructor(){
        super();
    }

    runTestHttpRequest(howMany = -10){
        this.filterForCoachings();
        this.formattedRows = this.formattedRows ? this.formattedRows : this.formatCoachingRows();
        const lastHowMany = this.formattedRows.slice(howMany);
        const testEndPoint = "https://script.google.com/a/macros/shift4.com/s/AKfycbzVwcCdBlPVyTrjXjd0aPTf_iWYe9tJLCTPhUHGqA7FQ-ownSx0ZIKz6Ovkgl_WQw8lTA/exec";
        lastHowMany.forEach((row, index) => {
            const requestOptions = {
                method: 'post',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
                },
                muteHttpExceptions: true
            };
            Logger.log("options: %s\nEndpoint:%s",requestOptions,testEndPoint);
            requestOptions["payload"] = JSON.stringify(row.coachingRow); // prepare for request
            Logger.log(JSON.stringify(row.coachingRow));
            sendHttpWithRetry(testEndPoint,requestOptions);
            Logger.log("index = %s",index);
        });
    }
}

function testHttpRequest(){
  new TestHttpRequest().runTestHttpRequest();
}

