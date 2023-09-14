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
  const colMap = MkData.mkColMap(sheetsAPI.get(BACKEND_ID,"'Call Scorecard Form Responses'!1:1").values[0]);
  // get doc properties
  const scriptProps = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock()
  lock.waitLock(600000); 
  // mk data
  let data;
  const offset = parseInt(scriptProps.getProperty("lr")); 
  try{
    Logger.log("range = %s",`Submissions!A${offset}:${MkData.columnToLetter(colMap.size)}`);
    data = sheetsAPI.get(BACKEND_ID,`'Call Scorecard Form Responses'!A${offset}:${MkData.columnToLetter(colMap.size)}`).values;
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
    if(!row[colMap.get("Agents Name")] || !row[colMap.get("Score")] || row[colMap.get("Email Sent")] == "Sent"){
      Logger.log("empty or already sent");
      return;
    }

    let updateValues = new Array(colMap.size); //the values being written to the sheet
    const timeStamp = updateTimestampValues(updateValues, colMap, row);


    let agentName = row[colMap.get("Agents Name")];
    let agentObj = NameToWFM.getAgentObj(agentName);

    if(!agentObj){
      Logger.log("agent was not found in WFM");
      updateValues[colMap.get("Email Sent")] = "Name Mismatch with WFM";
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }

    if(agentObj["Hire Date"]){
      updateHireDateValues(agentObj,updateValues,colMap,timeStamp)
    }
    

    let score = row[colMap.get("Score")];
    if (!score) {
      Logger.log("No Score then Don't send");
      writeToSheet(updateValues,index+offset);
      scriptProps.setProperty("lr",offset+index+1);
      return;
    }
    score = updateScoreValues(updateValues, colMap, score);
    
    doEmails.send(row,colMap,agentObj,score,updateValues); //assign the row as the chat id

    updateValues[colMap.get("Agent Location")] = agentObj["OFFICE LOCATION"];
    updateValues[colMap.get("Team")] = agentObj["Team"];
    Logger.log("Sent");
    writeToSheet(updateValues,index+offset);
    scriptProps.setProperty("lr",offset+index+1);
  });
  lock.releaseLock();
  setScoreFormat(offset);
}

function setScoreFormat(startRow){
  const ss = SpreadsheetApp.openById(BACKEND_ID);
  ss.getSheetByName("Call Scorecard Form Responses")
    .getRange(`E${startRow}:E`)
    .setNumberFormat("0.00%")
}


