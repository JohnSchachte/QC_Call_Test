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
    GmailApp.sendEmail("jschachte@shift4.com",subject,"",{
    // GmailApp.sendEmail(recipients,subject,"",{
      htmlBody: template.evaluate().getContent()
    });
  }