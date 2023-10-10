/**
 * Converts a score from the format .XXX* (or just .XXX) to XX.XX%.
 * @param {(string|number)} score - The score in the format .XXX* or .XXX.
 * @return {string} The score in the format XX.XX%.
 */
function convertScoreFormat(score) {
  // Convert the score to a string (in case it's a number)
  const scoreStr = String(score);

  // Remove any non-numeric characters (like '*') and parse the score
  const parsedScore = parseFloat(scoreStr.replace(/[^0-9.]/g, ''));

  // Convert the score to percentage format
  const percentageScore = (parsedScore * 100).toFixed(2) + '%';

  return percentageScore;
}

// Example usage:
const score1 = ".123*";
const score2 = 0.123;
console.log(convertScoreFormat(score1));  // Outputs: "12.30%"
console.log(convertScoreFormat(score2));  // Outputs: "12.30%"


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
  updateValues[colMap.get(MONTH_YEAR_HEADER)] = formatTimestamp_Month_Date(timeStamp);
  row[colMap.get(TIMESTAMP_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York","MM/dd/yyyy HH:mm:ss a") + " EST";
  return timeStamp;
}

function formatTimestamp_Month_Date(date){
  return Utilities.formatDate(date,"America/New_York", "MMMM yyyy");
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
    },BACKEND_ID,`${SUBMISSION_SHEET_NAME}!${index}:${index}`,{valueInputOption:"USER_ENTERED"})
  );
}