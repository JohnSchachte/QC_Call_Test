/**
 * Globals and constants for the application.
 */

/** Maximum time (in milliseconds) the script should wait for a lock. */
const LOCK_WAIT_TIME = 600000; // 10 minutes

/** Provides methods for accessing and modifying script properties. */
const scriptProps = PropertiesService.getScriptProperties();
/** Holds the properties set in the script's project properties. */
const scriptPropsObj = scriptProps.getProperties();

/** Backend ID for the application, fetched from script properties. */
const BACKEND_ID = scriptPropsObj["BACKEND_ID"];
/** Reporting ID for the application, fetched from script properties. */
const REPORTING_ID = scriptPropsObj["REPORTING_ID"];
/** Reference to the Google Sheets API. */
const sheetsAPI = Sheets.Spreadsheets.Values;
/** Not currently initialized, placeholder for Document properties. */
var docProp = null;

/** 
 * These are global header variables. They allow quick changes to the script if Reliability changes a header name.
 * This also provides flexibility to use mostly the same script for different applications, like Chat Evaluations.
 */
const TRANSCRIPT_ID_HEADER = scriptPropsObj["TRANSCRIPT_ID_HEADER"];
const IS_PRODUCTION = scriptPropsObj["IS_PRODUCTION"];
const IS_CALL = scriptPropsObj["IS_CALL"];
const TICKET_HEADER = scriptPropsObj["TICKET_HEADER"];
const AGENT_NAME_HEADER = scriptPropsObj["AGENT_NAME"];
const EMAIL_SENT_HEADER = scriptPropsObj["EMAIL_SENT"];
const SCORE_HEADER = scriptPropsObj["SCORE_HEADER"];
const AGENT_LOCATION_HEADER = scriptPropsObj["AGENT_LOCATION"];
const TEAM_HEADER = scriptPropsObj["TEAM_HEADER"];
const HIRE_DATE_HEADER = scriptPropsObj["HIRE_DATE_HEADER"];
const CC_EMAIL_HEADER = scriptPropsObj["CC_EMAIL_HEADER"];
const LT_3MONTHS_HEADER = scriptPropsObj["<3_MONTHS_HEADER"];
const GT_MONTHS_HEADER = scriptPropsObj[">3_MONTHS_HEADER"];
const TIMESTAMP_HEADER = scriptPropsObj["TIMESTAMP_HEADER"];
const DATE_HEADER = scriptPropsObj["DATE_HEADER"];
const MONTH_YEAR_HEADER = scriptPropsObj["MONTH_YEAR_HEADER"];
const PERC_SCORE_HEADER = scriptPropsObj["PERC_SCORE_HEADER"];
/** Name of the sheet where submissions are recorded. */
const SUBMISSION_SHEET_NAME = scriptPropsObj["SUBMISSION_SHEET_NAME"];
/** Threshold for scoring. */
const SCORE_THRESHOLD = 0.75; //arbitrary number from Reliability team
const EVALUATOR_HEADER = scriptPropsObj["EVALUATOR_HEADER"];
const MID_DBA_HEADER = scriptPropsObj["MID_DBA_HEADER"];
const COACHING_STATUS_HEADER = scriptPropsObj["Coaching Status"];
/** Name of the sheet for responses. */
const RESPONSE_SHEET_NAME = scriptPropsObj["Response Sheet Name"];
const DATE_SENT_HEADER = scriptPropsObj["DATE_SENT_HEADER"];
/** Name of the sheet for reliability reporting. */
const RELIABILITY_REPORTING_SHEET_NAME = scriptPropsObj["REPORTING_SHEET_NAME"];
/** Spreadsheet ID for reliability reporting. */
const RELIABILITY_REPORTING_SS_ID = scriptPropsObj["REPORTING_SS_ID"];

const REMOVE_COLS = JSON.parse(scriptPropsObj["REMOVE_COLS"]);