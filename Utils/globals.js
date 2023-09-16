// const BACKEND_ID_TEST = "1vyCKZ_8U6oUTH8kascB1nn9uWLOw-QIUcN0Er8ggCVw";
//const BACKEND_ID = "1FlFEkAEWH58yPcIbFz5hgOImKPkxfuI7Sv2RvMVbUKw"
const BACKEND_ID = "1Fsw8e7Htowi9uaB50XEbJXRAK3IuaNSoYFY9sNUpt8Y";
const sheetsAPI = Sheets.Spreadsheets.Values
const scriptProps = PropertiesService.getScriptProperties();
const scriptPropsObj = scriptProps.getProperties();
var docProp = null;
const TRANSCRIPT_ID_HEADER = scriptPropsObj["TRANSCRIPT_ID_HEADER"], 
TICKET_HEADER = scriptPropsObj["TICKET_HEADER"], 
AGENT_NAME_HEADER = scriptPropsObj["AGENT_NAME"], 
EMAIL_SENT_HEADER = scriptPropsObj["EMAIL_SENT"], 
SCORE_HEADER = scriptPropsObj["SCORE"], 
AGENT_LOCATION_HEADER = scriptPropsObj["AGENT_LOCATION"], 
TEAM_HEADER = scriptPropsObj["TEAM"], 
HIRE_DATE_HEADER = scriptPropsObj["HIRE_DATE"], 
EVAL_ID_HEADER = scriptPropsObj["EVAL_ID"],
CC_EMAIL_HEADER = scriptPropsObj["CC_EMAIL_HEADER"],
LT_3MONTHS_HEADER = scriptPropsObj["<3_MONTHS_HEADER"],
GT_MONTHS_HEADER = scriptPropsObj[">3_MONTHS_HEADER"],
TIMESTAMP_HEADER = scriptPropsObj["TIMESTAMP_HEADER"],
DATE_HEADER = scriptPropsObj["DATE_HEADER"],
MONTH_YEAR_HEADER = scriptPropsObj["MONTH_YEAR_HEADER"],
PERC_SCORE_HEADER = scriptPropsObj["PERC_SCORE_HEADER"],
SUBMISSION_SHEET_NAME = scriptPropsObj["SUBMISSION_SHEET_NAME"],
SCORE_THRESHOLD = 0.75, //arbitrary number from Reliability team
EVALUATOR_HEADER = scriptPropsObj["EVALUATOR_HEADER"],
MID_DBA_HEADER = scriptPropsObj["MID_DBA_HEADER"];