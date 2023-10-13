<<<<<<< HEAD
function processSingleCoaching(rowIndex="4541"){
=======
/**
 * Processes a single coaching entry based on the given row index.
 * 
 * - Fetches the row from the RESPONSE_SHEET_NAME based on the provided index.
 * - Retrieves the agent's score and calculates a final score.
 * - Obtains the agent object based on the agent's name.
 * - Initiates the coaching process for the agent.
 * 
 * @param {string} [rowIndex="8820"] - The index of the row in the RESPONSE_SHEET_NAME sheet.
 * @throws {Error} Throws an error if the agent object is not found.
 * @returns {void}
 */
function processSingleCoaching(rowIndex="8820") {
    // Get the column mapping for the sheet
>>>>>>> remoteTest/test
    const colMap = getColMap();

    // Fetch the entire row based on the provided index from the RESPONSE_SHEET_NAME sheet
    const row = Sheets.Spreadsheets.Values.get(BACKEND_ID,`${RESPONSE_SHEET_NAME}!${rowIndex}:${rowIndex}`).values[0];

    // Retrieve the score of the agent from the fetched row
    let score = row[colMap.get(SCORE_HEADER)];

    // If there's no score for the agent, log the message and exit the function
    if (!score) {
        Logger.log("No Score then Don't send");
        return;
    }

    // Calculate the final score for the agent
    let calculatedScore = calculateScore(score);
    
    // Fetch the agent object based on the agent's name from the row
    const agentObj = NameToWFM.getAgentObj(row[colMap.get(AGENT_NAME_HEADER)]);
    
    // If the agent object is missing, throw an error
    if(!agentObj) throw new Error("No Agent Object");

    // Initiate the coaching process for the agent
    alertAndCoach(row, agentObj, calculatedScore, rowIndex);
}
