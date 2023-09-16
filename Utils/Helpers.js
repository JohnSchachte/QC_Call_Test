function getColMap(){
    const cache = CacheService.getScriptCache();
    const memoizedReads = Custom_Utilities.getMemoizedReads(cache);
    return Custom_Utilities.mkColMap(memoizedReads(BACKEND_ID,`${SUBMISSION_SHEET_NAME}!1:1`,{majorDimension:"ROWS"}).values[0]);
}