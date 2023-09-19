function getColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!1:1`,{majorDimension:"ROWS"}).values[0]);
}

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
    // CHANGE FOR PRODUCTION!!! THIS IS THE TEST ENDPOINT.
    GmailApp.sendEmail("jschachte@shift4.com",subject,"",{
    // GmailApp.sendEmail(recipients,subject,"",{
      htmlBody: template.evaluate().getContent()
    });
  }

function setScoreFormat(startRow,colMap){
  const ss = SpreadsheetApp.openById(BACKEND_ID);
  const scorePercCol = Custom_Utilities.columnToLetter(colMap.get(PERC_SCORE_HEADER)+1);
  ss.getSheetByName("Call Scorecard Form Responses")
    .getRange(`${(scorePercCol)}${startRow}:${scorePercCol}`)
    .setNumberFormat("0.00%")
}

const initializeCoaching = function (){
  try{
    const t = Custom_Utilities.setUpTrigger(ScriptApp,"initializeAlertAndCoaching",1); //returns trigger id
    const cache = CacheService.getScriptCache();
    cache.put(t,JSON.stringify({row,agentObj,score,updateValues,rowIndex:index+offset}));
    
  }catch(f){
    Logger.log(f);
    try{
      alertAndCoach(row,agentObj,score,index+offset);
    }catch(f){
      Logger.log(f);
      return;
    }
  }
}; 