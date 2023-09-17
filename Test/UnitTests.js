function testUpdateScoreValues(){
    const colMap = getColMapTest();
    const updateValues = new Array(colMap.size);
    const score = "176 / 201";
    const updatedScore = updateScoreValues(updateValues, colMap, score);
    const expectedScore = Math.round((score[0] / score[1])*10000);
    
    if(updatedScore !== expectedScore) {
      Logger.log("score was %s. score was supposed to be %s", updatedScore, expectedScore);
      throw new Error();
    };
}

function getSupSheet(){
  const cache = CacheService.getScriptCache();
  const agentObj = NameToWFM.getAgentObj("Schachte, John");
  const getTeams = Custom_Utilities.memoize(() => CoachingRequestScripts.getTeams(REPORTING_ID), cache);
  const supSheetUrl = CoachingRequestScripts.getSupCoachingSheet(getTeams(),agentObj);
  if(supSheetUrl === "https://docs.google.com/spreadsheets/d/1ZG2DqMHKIgkQaUGpYgZwr-84AaQW5gocsQIv9rGagu0/edit#gid=1616052674") return true;
  throw new Error();
}



