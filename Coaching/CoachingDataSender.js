/**
 * Sends coaching data to the backend.
 * 
 * - Formats the coaching row data.
 * - Makes an HTTP POST request with the coaching data.
 * - Handles potential failures by sending an email notification and logging the issue.
 * 
 * @param {Array} row - The data row from the spreadsheet.
 * @param {Map} colMap - Column mapping for the spreadsheet.
 * @param {Object} agentObj - Agent object details.
 * @param {string} severity - Coaching severity level.
 * @param {Array} categories - Coaching categories.
 * @param {number} rowIndex - Index of the row in the spreadsheet.
 * @param {Object} coachingHeaders - Coaching headers for formatting the row.
 * @returns {Object} - An object containing the coachingRow data and the coachingId.
 */
function sendCoachingData(row, colMap, agentObj, severity, categories, rowIndex, coachingHeaders) {
    const cache = CacheService.getScriptCache();
    const memoizedGetHttp = Custom_Utilities.memoize(getHttp, cache);
    
    // Bind and format the coaching data row for the HTTP request
    const boundFormatAsCoachingRow = formatAsCoachingRow.bind({coachingHeaders});
    const coachingRow = boundFormatAsCoachingRow(row, colMap, agentObj, severity, categories, calculateScore(row[colMap.get(SCORE_HEADER)]));
    
    const requestOptions = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + CoachingRequestScripts.getOAuthService().getAccessToken()
        },
    };

    const endPoint = memoizedGetHttp(agentObj["Team"], cache);
    requestOptions["payload"] = JSON.stringify(coachingRow); // prepare payload for request
    
    let response;

    try {
        response = retry(() => sendHttpWithRetry(
                IS_PRODUCTION == "true" ? endPoint : "https://script.google.com/a/macros/shift4.com/s/AKfycbzVwcCdBlPVyTrjXjd0aPTf_iWYe9tJLCTPhUHGqA7FQ-ownSx0ZIKz6Ovkgl_WQw8lTA/exec", 
                requestOptions
            )
        );
    } catch (f) {
        Logger.log(f);
        Logger.log("Row: %s was NOT appended to a coaching backend sheet", rowIndex);
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com", "Coaching Request Failure for Row: " + rowIndex, "Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(coachingRow));
        throw new HTTPError(`HTTP FAILURE. REACH OUT OT PI.\n Timestamp: ${new Date().toLocaleString()}`);
    }

    const coachingId = response["id"];
    if (!coachingId) {
        Logger.log("Row: %s was NOT appended to a coaching backend sheet", rowIndex);
        GmailApp.sendEmail("jschachte@shift4.com,pi@shift4.com", "Coaching Request Failure for Row: " + rowIndex, "Script: 1Yts8oTB89I_dvkIMkxIaDcrqsnLL_d7vSmtmDxPzkjqOI43gA5so84kk\n\nRow: " + rowIndex + "\n\n" + JSON.stringify(coachingRow));
        throw new CoachingIdNull(`Coaching Id received from Coaching backend was null. REACH OUT TO PI.\n Timestamp: ${new Date().toLocaleString()}`);
    }

    return {
        coachingRow: coachingRow,
        coachingId: coachingId
    };
}

/**
 * Sends an HTTP request with retries in case of failures.
 * 
 * @param {string} endPoint - The endpoint to send the HTTP request to.
 * @param {Object} requestOptions - The options for the HTTP request.
 * @returns {Object} - Parsed response from the HTTP request.
 * @throws {Error} Throws an error if the HTTP response can't be parsed.
 */
function sendHttpWithRetry(endPoint, requestOptions) {
    const response = UrlFetchApp.fetch(endPoint, requestOptions);
    Logger.log(response.getContentText());
    return JSON.parse(response.getContentText()); // this is what will actually trigger the error, NOT the line above
}