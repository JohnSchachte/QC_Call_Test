function testUpdateScoreValues(){
    const colMap = getColMapTest();
    const updateValues = new Array(colMap.size);
    const score = "176 / 201";
    const updatedScore = updateScoreValues(updateValues, colMap, score);
    const expectedScore = Math.round((score[0] / score[1])*10000);
    
    if(updatedScore !== expectedScore) {
      Logger.log("score was %s. score was supposed to be %s", updatedScore, expectedScore);
      throw new Error();
    };
}



