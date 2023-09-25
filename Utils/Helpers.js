function getColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!1:1`,{majorDimension:"ROWS"}).values[0]);
}

/**
 * Checks if a given timestamp is less than 5 months from a given hire date
 * @param {Date} hireDate - The starting date
 * @param {Date} timestamp - The date to compare to the hire date
 * @returns {boolean} True if the timestamp is less than 5 months from the hire date, false otherwise
 */
function under4Months(hireDate, timestamp) {
  Logger.log("hire date = %s",hireDate);
  Logger.log("timestamp = %s",timestamp);

  let fourMonths = new Date(hireDate.getFullYear(), hireDate.getMonth() + 4, 1); // four months from the hireDate, at start of the month
  return timestamp < fourMonths;
};


/**
 * logic for transforming transcriptIds.
 * @param {String[]} transcriptIds - an array of transcript ids to transform or null.
 * @return {Array} - An array of transformed transcript ids.
 */
function transformTranscriptIds(transcriptIds){
  if(!transcriptIds){
    return false;
  }
  return transcriptIds.split(/\s*\,\s*/g).map(id =>({href:"https://na1.nice-incontact.com/player/#/cxone-player/segments/" + id, id}));
}

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

function sendEmail(recipients,subject,template){
  Logger.log("receipients: %s",recipients);
  recipients = IS_PRODUCTION == "true" ? recipients : "jschachte@shift4.com";
  GmailApp.sendEmail(recipients,subject,"",{
    htmlBody: template.evaluate().getContent()
  });
}

function setScoreFormat(startRow,colMap){
  const ss = SpreadsheetApp.openById(BACKEND_ID);
  const scorePercCol = Custom_Utilities.columnToLetter(colMap.get(PERC_SCORE_HEADER)+1);
  ss.getSheetByName(RESPONSE_SHEET_NAME)
    .getRange(`${(scorePercCol)}${startRow}:${scorePercCol}`)
    .setNumberFormat("0.00%")
}

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