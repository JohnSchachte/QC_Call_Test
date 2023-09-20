const scriptProps = PropertiesService.getScriptProperties();
const scriptPropsObj = scriptProps.getProperties();

// const BACKEND_ID_TEST = scriptPropsObj["BACKEND_ID_TEST"];
const BACKEND_ID = scriptPropsObj["BACKEND_ID"];
const REPORTING_ID = scriptPropsObj["REPORTING_ID"];
const sheetsAPI = Sheets.Spreadsheets.Values
var docProp = null;

/* These are global header variables. 
This is to allow quick changes to the script if Reliability changes a header name on us.
This also allows us to use mostly the same script for different applications (Like Chat Evaluations).
*/
const TRANSCRIPT_ID_HEADER = scriptPropsObj["TRANSCRIPT_ID_HEADER"], 
IS_PRODUCTION = scriptPropsObj["IS_PRODUCTION"],
TICKET_HEADER = scriptPropsObj["TICKET_HEADER"], 
AGENT_NAME_HEADER = scriptPropsObj["AGENT_NAME"], 
EMAIL_SENT_HEADER = scriptPropsObj["EMAIL_SENT"], 
SCORE_HEADER = scriptPropsObj["SCORE_HEADER"], 
AGENT_LOCATION_HEADER = scriptPropsObj["AGENT_LOCATION"], 
TEAM_HEADER = scriptPropsObj["TEAM_HEADER"], 
HIRE_DATE_HEADER = scriptPropsObj["HIRE_DATE"], 
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
MID_DBA_HEADER = scriptPropsObj["MID_DBA_HEADER"],
COACHING_STATUS_HEADER = scriptPropsObj["Coaching Status"],
RESPONSE_SHEET_NAME = scriptPropsObj["Response Sheet Name"],
DATE_SENT_HEADER = scriptPropsObj["DATE_SENT_HEADER"];
