// Test: https://script.google.com/u/0/home/projects/1sdajPEm4Dv5Gsx5zq0keM4xPEOXTHublMt_bWHKbvUvIPOogEfHfW4u8/edit

/**
 * Main function that fetches data from a sheet, creates and sends emails, and updates the sheet.
 */
function main(){

  // get colMap
  const colMap = getColMap();

  const lock = LockService.getScriptLock();
  const LOCK_WAIT_TIME = 600000; // 10 minutes
  lock.waitLock(LOCK_WAIT_TIME); // wait 10 minutes for others' use of the code section and lock it when available

  // make data
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

  // initialize email sender
  const doEmails = new DoEmails();

  data.forEach((row,index) => {
    // skip row conditions. will run for name mismatches as "Email Sent" headers
    if(!row[colMap.get(AGENT_NAME_HEADER)] || !row[colMap.get(SCORE_HEADER)] || row[colMap.get(EMAIL_SENT_HEADER)] == "Sent"){
      Logger.log("empty or already sent");
      return;
    }

    let updateValues = new Array(colMap.size); // the values being written to the sheet.
    const timeStamp = updateTimestampValues(updateValues, colMap, row); //updates timestamp but also returns it for further use


    const agentName = row[colMap.get(AGENT_NAME_HEADER)];
    const agentObj = NameToWFM.getAgentObj(agentName);

    if(!agentObj){
      Logger.log("agent was not found in WFM");
      updateValues[colMap.get(EMAIL_SENT_HEADER)] = "Name Mismatch with WFM";
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }

    if(agentObj["Hire Date"]) updateHireDateValues(agentObj,updateValues,colMap,timeStamp);
    

    let score = row[colMap.get(SCORE_HEADER)];
    if (!score) {
      Logger.log("No Score then Don't send");
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }

    score = updateScoreValues(updateValues, colMap, score);
    updateValues[colMap.get(AGENT_LOCATION_HEADER)] = agentObj["OFFICE LOCATION"];
    updateValues[colMap.get(TEAM_HEADER)] = agentObj["Team"];
    Logger.log("Sent");
    scriptProps.setProperty("lr",offset+index+1); // update the last row to record where the script starts next time

    doEmails.send(row,colMap,agentObj,score,updateValues); //assign the row as the chat id
    writeToSheet(updateValues,index+offset);
    
    const coachingStatus = row[colMap.get(COACHING_STATUS_HEADER)];
    if(!coachingStatus || !coachingStatus.includes("Coaching Id:")) initializeCoaching(row,agentObj,score,index+offset);
  }); // end of loop


  lock.releaseLock();
  setScoreFormat(offset,colMap);
}