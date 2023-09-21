function sendCoachingData(row, colMap, agentObj, severity, categories, rowIndex, a1Notation,writeCoachingStatus,coachingHeaders) {

  const cache = CacheService.getScriptCache();
  const memoizedGetHttp = Custom_Utilities.memoize(getHttp,cache);
  
  const boundFormatAsCoachingRow = formatAsCoachingRow.bind({coachingHeaders});
  const coachingRow = boundFormatAsCoachingRow(row, colMap, agentObj, severity, categories,calculateScore(row[colMap.get(SCORE_HEADER)]));

    
    const requestOptions = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
        },
    };
    
    const endPoint = memoizedGetHttp(agentObj["Team"],cache);

    requestOptions["payload"] = JSON.stringify(coachingRow); // prepare for request

    let response;
    const failureFunc = () => {
        // Assumption if there's an error then content can't get parsed.
        Logger.log("Row: %s was NOT appended to a coaching backend sheet",rowIndex);
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com","Coaching Request Failure for Row: " + rowIndex,"Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(coachingRow));
        writeCoachingStatus(a1Notation,`HTTP FAILURE. REACH OUT OT PI.\n Timestamp: ${new Date().toLocaleString()}`);
        throw new Error("Row: " + rowIndex + " was NOT appended to a coaching backend sheet");
    }
    try{
        response = retry(() => sendHttpWithRetry(
            IS_PRODUCTION == "true" ? endPoint : "https://script.google.com/a/macros/shift4.com/s/AKfycbzVwcCdBlPVyTrjXjd0aPTf_iWYe9tJLCTPhUHGqA7FQ-ownSx0ZIKz6Ovkgl_WQw8lTA/exec",requestOptions))
    }catch(f){
        Logger.log(f);
        failureFunc();
    }

    const coachingId = response["id"];

    if(coachingId){
        writeCoachingStatus(a1Notation,`Coaching Id: ${coachingId}\n Timestamp: ${new Date().toLocaleString()}\nSeverity: ${severity}\nCategories: ${categories}`);
    }else{
        failureFunc();
    }

    return {
        coachingRow: coachingRow,
        coachingId: coachingId
    };
}

function sendHttpWithRetry(endPoint,requestOptions){
    const response = UrlFetchApp.fetch(endPoint,requestOptions);
    Logger.log(response.getContentText())
    return JSON.parse(response.getContentText()); // this is what will actually trigger the error. NOT the line above
}