/**
 * Updates the hire date related values in the 'updateValues' array.
 * @param {Object} agentObj - The object containing agent's data.
 * @param {Array} updateValues - The array of values to update.
 * @param {Map} colMap - The map containing column indexes.
 * @param {Array} row - The current row data.
 */
function updateHireDateValues(agentObj, updateValues, colMap,timeStamp){
  const hireDate = new Date(agentObj[HIRE_DATE_HEADER]);
  updateValues[colMap.get(HIRE_DATE_HEADER)] = agentObj[HIRE_DATE_HEADER];

  const flag = under4Months(hireDate,timeStamp,120);
  updateValues[colMap.get(LT_3MONTHS_HEADER)] = flag;

  updateValues[colMap.get(GT_MONTHS_HEADER)] = !flag;
}

/**
 * Updates the timestamp related values in the 'updateValues' array.
 * @param {Array} updateValues - The array of values to update.
 * @param {Map} colMap - The map containing column indexes.
 * @param {Array} row - The current row data.
 */
function updateTimestampValues(updateValues, colMap, row){
  let timeStamp = new Date(row[colMap.get(TIMESTAMP_HEADER)]);
  updateValues[colMap.get(DATE_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York", "MM/dd/yyyy");
  updateValues[colMap.get(MONTH_YEAR_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York", "MMMM yyyy");
  row[colMap.get(TIMESTAMP_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York","MM/dd/yyyy HH:mm:ss a") + " EST";
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
  const [numerator, denominator] = score.split(" / ").map(integer => parseInt(integer));
  const calculatedScore = Math.round((numerator / denominator) * 10000);
  updateValues[colMap.get(PERC_SCORE_HEADER)] = calculatedScore / 10000;
  return calculatedScore;
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
    values:[updateValues],
    },BACKEND_ID,`'Call Scorecard Form Responses'!${index}:${index}`,{valueInputOption:"USER_ENTERED"})
  );
}