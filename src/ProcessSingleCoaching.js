function processSingleCoaching(rowIndex="8221"){
    const colMap = getColMap();

    const row = Sheets.Spreadsheets.Values.get(BACKEND_ID_TEST,`${RESPONSE_SHEET_NAME}!${rowIndex}:${rowIndex}`).values[0]

    // get score
    let score = row[colMap.get(SCORE_HEADER)];
    if (!score) {
        Logger.log("No Score then Don't send");
        return;
    }
    let calculatedScore = calculateScore(score);
    
    const agentObj = NameToWFM.getAgentObj(row[colMap.get(AGENT_NAME_HEADER)]);
    if(!agentObj) throw new Error("No Agent Object");
    alertAndCoach(row,agentObj,calculatedScore,rowIndex);
}



