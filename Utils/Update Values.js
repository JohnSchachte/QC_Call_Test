/**
 * Calculates a score from a string in the format "numerator / denominator".
 * @param {string} score - A string in the format "numerator / denominator".
 * @returns {number} - The calculated score rounded to four decimal places.
 */
function calculateScore(score){
  const [numerator, denominator] = score.split(" / ").map(integer => parseInt(integer));
  return Math.round((numerator / denominator) * 10000) / 10000;
}

/**
 * Converts a score into a percentage format.
 * @param {(string|number)} score - The score to convert.
 * @returns {string} - The score in percentage format.
 */
function convertScoreFormat(score) {
  const scoreStr = String(score);
  const parsedScore = parseFloat(scoreStr.replace(/[^0-9.]/g, ''));
  const percentageScore = (parsedScore * 100).toFixed(2) + '%';
  return percentageScore;
}

/**
 * Updates hire date values in a provided values map.
 * @param {Object} agentObj - Object containing agent's data.
 * @param {Array} updateValues - Array containing values to update.
 * @param {Map} colMap - Column map to locate columns by header.
 * @param {Date} timeStamp - Timestamp associated with the current record.
 */
function updateHireDateValues(agentObj, updateValues, colMap, timeStamp){
  const hireDate = new Date(agentObj[HIRE_DATE_HEADER]);
  updateValues[colMap.get(HIRE_DATE_HEADER)] = agentObj[HIRE_DATE_HEADER];
  const flag = under4Months(hireDate, timeStamp, 120);
  updateValues[colMap.get(LT_3MONTHS_HEADER)] = flag;
  updateValues[colMap.get(GT_MONTHS_HEADER)] = !flag;
}

/**
 * Updates timestamp values in a provided values map.
 * @param {Array} updateValues - Array containing values to update.
 * @param {Map} colMap - Column map to locate columns by header.
 * @param {Array} row - Array representing a single row of data.
 * @returns {Date} - The parsed timestamp.
 */
function updateTimestampValues(updateValues, colMap, row){
  let timeStamp = new Date(row[colMap.get(TIMESTAMP_HEADER)]);
  updateValues[colMap.get(DATE_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York", "MM/dd/yyyy");
  updateValues[colMap.get(MONTH_YEAR_HEADER)] = formatTimestamp_Month_Date(timeStamp);
  row[colMap.get(TIMESTAMP_HEADER)] = Utilities.formatDate(timeStamp,"America/New_York","MM/dd/yyyy HH:mm:ss a") + " EST";
  return timeStamp;
}

/**
 * Formats a date to display the month and year.
 * @param {Date} date - The date to format.
 * @returns {string} - Formatted date string in "MMMM yyyy" format.
 */
function formatTimestamp_Month_Date(date){
  return Utilities.formatDate(date,"America/New_York", "MMMM yyyy");
}

/**
 * Updates score values in a provided values map.
 * @param {Array} updateValues - Array containing values to update.
 * @param {Map} colMap - Column map to locate columns by header.
 * @param {string} score - The score in "numerator / denominator" format.
 * @returns {number} - The calculated score.
 */
function updateScoreValues(updateValues, colMap, score){
  const [numerator, denominator] = score.split(" / ").map(integer => parseInt(integer));
  const calculatedScore = Math.round((numerator / denominator) * 10000);
  updateValues[colMap.get(PERC_SCORE_HEADER)] = calculatedScore / 10000;
  return calculatedScore;
}

/**
 * Writes provided values to the spreadsheet at the specified row index.
 * @param {Array} updateValues - Array of values to write.
 * @param {number} index - The row index where values should be updated.
 */
function writeToSheet(updateValues, index){
  Custom_Utilities.exponentialBackoff(() => sheetsAPI.update(
    {
    majorDimension: "ROWS",
    values: [updateValues],
    }, BACKEND_ID, `${SUBMISSION_SHEET_NAME}!${index}:${index}`, {valueInputOption: "USER_ENTERED"})
  );
}
