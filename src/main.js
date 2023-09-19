// Test: https://script.google.com/u/0/home/projects/1sdajPEm4Dv5Gsx5zq0keM4xPEOXTHublMt_bWHKbvUvIPOogEfHfW4u8/edit

function mainWrapper(){
  // usually an older version
  Self.main();
}
/**
 * Main function that fetches data from a sheet, creates and sends emails, and updates the sheet.
 */
function main(){
  // get colMap
  const colMap = getColMap();

  const lock = LockService.getScriptLock();
  lock.waitLock(600000);
  // mk data
  let data;
  const offset = parseInt(scriptProps.getProperty("lr")); 
  try{
    Logger.log("range = %s",`Submissions!A${offset}:${Custom_Utilities.columnToLetter(colMap.size)}`);
    data = sheetsAPI.get(BACKEND_ID,`'Call Scorecard Form Responses'!A${offset}:${Custom_Utilities.columnToLetter(colMap.size)}`).values;
  }catch(L){
    Logger.log(L);
    return;
  }
  if(!data){
    Logger.log("No data to process!");
    return;
  }

  const doEmails = new DoEmails();
  data.forEach((row,index) => {
    // // skip row conditions. THIS WILL RUN FOR NAME MISMATCHES
    if(!row[colMap.get(AGENT_NAME_HEADER)] || !row[colMap.get(SCORE_HEADER)] || row[colMap.get(EMAIL_SENT_HEADER)] == "Sent"){
      Logger.log("empty or already sent");
      return;
    }

    let updateValues = new Array(colMap.size); // the values being written to the sheet.
    const timeStamp = updateTimestampValues(updateValues, colMap, row); //updates timestamp but also returns it for further use


    let agentName = row[colMap.get(AGENT_NAME_HEADER)];
    let agentObj = NameToWFM.getAgentObj(agentName);

    if(!agentObj){
      Logger.log("agent was not found in WFM");
      updateValues[colMap.get(EMAIL_SENT_HEADER)] = "Name Mismatch with WFM";
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }

    if(agentObj["Hire Date"]){
      updateHireDateValues(agentObj,updateValues,colMap,timeStamp);
    }
    

    let score = row[colMap.get(SCORE_HEADER)];
    if (!score) {
      Logger.log("No Score then Don't send");
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }

    score = updateScoreValues(updateValues, colMap, score);
      /**
       * TODO;
       * 1. Test while iterating with main on Test sheet
       */
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

    doEmails.send(row,colMap,agentObj,score,updateValues); //assign the row as the chat id
    
    updateValues[colMap.get(AGENT_LOCATION_HEADER)] = agentObj["OFFICE LOCATION"];
    updateValues[colMap.get(TEAM_HEADER)] = agentObj["Team"];
    Logger.log("Sent");
    writeToSheet(updateValues,index+offset);

    scriptProps.setProperty("lr",offset+index+1); // update the last row to record where the script starts next time
  
  });
  lock.releaseLock();
  setScoreFormat(offset,colMap);
}

function setScoreFormat(startRow,colMap){
  const ss = SpreadsheetApp.openById(BACKEND_ID);
  const scorePercCol = Custom_Utilities.columnToLetter(colMap.get(PERC_SCORE_HEADER)+1);
  ss.getSheetByName("Call Scorecard Form Responses")
    .getRange(`${(scorePercCol)}${startRow}:${scorePercCol}`)
    .setNumberFormat("0.00%")
}


