/**
 * Updates the hire date related values in the 'updateValues' array.
 * @param {Object} agentObj - The object containing agent's data.
 * @param {Array} updateValues - The array of values to update.
 * @param {Map} colMap - The map containing column indexes.
 * @param {Array} row - The current row data.
 */
function updateHireDateValues(agentObj, updateValues, colMap,timeStamp){
  const hireDate = new Date(agentObj["Hire Date"]);
  updateValues[colMap.get("Hire Date")] = agentObj["Hire Date"];

  const flag = under4Months(hireDate,timeStamp,120);
  updateValues[colMap.get("<3 Months Hire")] = flag;

  updateValues[colMap.get(">3 Months Hire")] = !flag;
}

/**
 * Updates the timestamp related values in the 'updateValues' array.
 * @param {Array} updateValues - The array of values to update.
 * @param {Map} colMap - The map containing column indexes.
 * @param {Array} row - The current row data.
 */
function updateTimestampValues(updateValues, colMap, row){
  let timeStamp = new Date(row[colMap.get("Timestamp")]);
  updateValues[colMap.get("Date")] = Utilities.formatDate(timeStamp,"America/New_York", "MM/dd/yyyy");
  updateValues[colMap.get("Month & Year")] = Utilities.formatDate(timeStamp,"America/New_York", "MMMM yyyy");
  row[colMap.get("Timestamp")] = Utilities.formatDate(timeStamp,"America/New_York","MM/dd/yyyy HH:mm:ss a") + " EST";
  return timeStamp;
}

/**
 * Updates the score in the 'updateValues' array.
 * @param {Array} updateValues - The array of values to update.
 * @param {Map} colMap - The map containing column indexes.
 * @param {string} score - The score to update.
 * @return {number} The updated score value.
 */
function updateScoreValues(updateValues, colMap, score){
  score = score.split(" / ").map(integer => parseInt(integer));
  score = Math.round((score[0] / score[1])*10000);
  updateValues[colMap.get("% Score")] = score/10000;
  return score;
}

/**
 * Writes an array of values to a specified row in the 'Call Scorecard Form Responses' sheet.
 * @param {Array} updateValues - The array of values to write to the sheet.
 * @param {Number} index - The row number to write the values to.
*/
function writeToSheet(updateValues,index){
  Custom_Utilities.exponentialBackoff(() =>sheetsAPI.update(
    {
    majorDimension:"ROWS",
    values:[updateValues]
    },BACKEND_ID,`'Call Scorecard Form Responses'!${index}:${index}`,{valueInputOption:"USER_ENTERED"})
  );
}