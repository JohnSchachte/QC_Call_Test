/**
 * Get a column map for the submission sheet's header row using memoization.
 * Memoization ensures that if the column map for the submission sheet's header row has 
 * been previously fetched, it is retrieved from the cache instead of reading from the sheet again.
 * @returns {Map} - A column map for the submission sheet.
 */
function getColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!1:1`,{majorDimension:"ROWS"}).values[0]);
}

/**
 * Determine if the difference between the hire date and a given timestamp is less than 4 months.
 * @param {Date} hireDate - The agent's hire date.
 * @param {Date} timestamp - The given timestamp.
 * @returns {boolean} - True if the difference is under 4 months, else false.
 */
function under4Months(hireDate, timestamp) {
  Logger.log("hire date = %s",hireDate);
  Logger.log("timestamp = %s",timestamp);

  let fourMonths = new Date(hireDate.getFullYear(), hireDate.getMonth() + 4, 1); // four months from the hireDate, at start of the month
  return timestamp < fourMonths;
};


/**
 * Convert transcript IDs to objects with href links.
 * @param {string} transcriptIds - Comma separated string of transcript IDs.
 * @returns {Array} - Array of objects with href links for each ID.
 */
function transformTranscriptIds(transcriptIds){
  if(!transcriptIds){
    return false;
  }
  return transcriptIds.split(/\s*\,\s*/g).map(id =>({href:"https://na1.nice-incontact.com/player/#/cxone-player/segments/" + id, id}));
}

/**
 * Retry a function until it succeeds or max retries is reached.
 * @param {function} tryFunct - Function to be retried.
 * @param {number} [waitTime=1000] - Time (ms) to wait between retries.
 * @param {number} [maxRetries=Number.MAX_VALUE] - Maximum number of retries.
 * @returns {any} - Result of the function once it succeeds.
 */
function retry(tryFunct, waitTime = 1000,maxRetries=Number.MAX_VALUE) {
  let result,tries=0; // the thing we're trying to get
  while(waitTime > 0 && tries < maxRetries){
    try{
      result = tryFunct();
      waitTime = 0;
    }catch(L){
      Logger.log(L);
      Custom_Utilities.longSleep(waitTime);
      tries++;
    }
  }
  return result;
}

/**
 * Send an email using a template.
 * @param {string} recipients - Recipient email addresses.
 * @param {string} subject - Email subject.
 * @param {HtmlService.HtmlTemplate} template - Email body template.
 */
function sendEmail(recipients,subject,template){
  Logger.log("receipients: %s",recipients);
  recipients = IS_PRODUCTION == "true" ? recipients : "jschachte@shift4.com";
  GmailApp.sendEmail(recipients,subject,"",{
    htmlBody: template.evaluate().getContent()
  });
}

/**
 * Set the number format for score columns.
 * @param {number} startRow - Starting row for the range.
 * @param {Map} colMap - Column map for the sheet.
 */
function setScoreFormat(startRow,colMap){
  const ss = SpreadsheetApp.openById(BACKEND_ID);
  const scorePercCol = Custom_Utilities.columnToLetter(colMap.get(PERC_SCORE_HEADER)+1);
  ss.getSheetByName(RESPONSE_SHEET_NAME)
    .getRange(`${(scorePercCol)}${startRow}:${scorePercCol}`)
    .setNumberFormat("0.00%")
}

/**
 * Initialize coaching for a given row, agent, score, and row index.
 * If setting up a trigger fails, try to directly alert and coach.
 * @param {Array} row - Data row.
 * @param {Object} agentObj - Agent's details.
 * @param {number} score - Agent's score.
 * @param {number} rowIndex - Index of the row.
 */
const initializeCoaching = function (row,agentObj,score,rowIndex){
  try{
    const t = Custom_Utilities.setUpTrigger(ScriptApp,"initializeAlertAndCoaching",1); //returns trigger id
    const cache = CacheService.getScriptCache();
    cache.put(t.getUniqueId(),JSON.stringify({row,agentObj,score,rowIndex}));
    
  }catch(f){
    Logger.log(f);
    try{
      alertAndCoach(row,agentObj,score,rowIndex);
    }catch(f){
      Logger.log(f);
      return;
    }
  }
}; 