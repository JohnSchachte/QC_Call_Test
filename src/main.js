/**
 * Entry point function to start the script.
 */
function mainWrapper(){
  Self.main();
}

/**
 * Main function that fetches data from a sheet, creates and sends emails, and updates the sheet.
 * @description 
 * 1. Retrieves column mapping.
 * 2. Acquires a script lock to prevent overlapping execution.
 * 3. Retrieves data from the submissions sheet.
 * 4. Initializes the email sender.
 * 5. Processes each row of data:
 *   - Checks if the row qualifies for processing.
 *   - Retrieves and updates agent information.
 *   - Checks and updates score.
 *   - Sends email.
 *   - Writes updated values back to the sheet.
 *   - Optionally initializes a coaching session.
 * 6. Releases the script lock.
 * 7. Sets the score format for the data processed.
 */
function main(){

  // get schema for the backend
  const colMap = getColMap();

  //lock in case main takes longer than the next trigger event.
  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_WAIT_TIME); // wait 10 minutes for others' use of the code section and lock it when available

  // make data
  let data;
  const offset = parseInt(scriptProps.getProperty("lr")); 
  try{
    Logger.log("range = %s",`Submissions!A${offset}:${Custom_Utilities.columnToLetter(colMap.size)}`);
    data = sheetsAPI.get(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!A${offset}:${Custom_Utilities.columnToLetter(colMap.size)}`).values;
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
      Logger.log("agent was not found in WFM so we can't send to their because we cannot look it up");
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
    Logger.log("Sent for row %s",(offset+index));
    scriptProps.setProperty("lr",offset+index+1); // update the last row to record where the script starts next time
    
    if(IS_CALL == "false"){
      updateValues[colMap.get("Chat Id")] = (offset+index).toString();
      row[colMap.get("Chat Id")] = (offset+index).toString();
    }

    doEmails.send(row,colMap,agentObj,score,updateValues); //assign the row as the chat id
    writeToSheet(updateValues,index+offset);
    
    const coachingStatus = row[colMap.get(COACHING_STATUS_HEADER)];

    if(!coachingStatus || !coachingStatus.includes("Coaching Id:")) initializeCoaching(row,agentObj,calculateScore(row[colMap.get(SCORE_HEADER)]),index+offset);
  }); // end of loop


  lock.releaseLock();
  setScoreFormat(offset,colMap);
}