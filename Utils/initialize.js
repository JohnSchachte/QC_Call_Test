function initializeLastRow() {
  // const submSheet = SpreadsheetApp.openById(BACKEND_ID).getSheetByName("Submissions");
  scriptProps.setProperty("lr",(7738).toString()); // change number to the last row you want to do.
}

// /**
//  * row 1576 shows an example of the race condition of using a form submit with a getLastRow() 
//  */

// function initializeFormTrigger(){
//   const form = FormApp.openById("17sSSqjmpEeb1an8KtRYqEP29ms7FhAE-oMlqteGkFU0")
//   ScriptApp.newTrigger("mainWrapper")
//     .forForm(form)
//     .onFormSubmit()
//     .create();
// }

function setScriptProperties(){
  scriptProp.setProperty("TRANSCRIPT_ID_HEADER","Record ID");
  scriptProp.setProperty("TICKET_HEADER","Ticket#");
  scriptProp.setProperty("AGENT_NAME","Agents Name");
  scriptProp.setProperty("EMAIL_SENT","Email Sent");
  scriptProp.setProperty("SCORE","Score");
  scriptProp.setProperty("AGENT_LOCATION","Agent Location");
  scriptProp.setProperty("TEAM","Team");
  scriptProp.setProperty("HIRE_DATE","Hire Date");
  scriptProp.setProperty("EVAL_ID","Eval ID");
  scriptProp.setProperty("CC_EMAIL_HEADER","CC Email");
  scriptProp.setProperty("HIRE_DATE_HEADER","Hire Date");
  scriptProp.setProperty("<3_MONTHS_HEADER","<3 Months Hire");
  scriptProp.setProperty(">3_MONTHS_HEADER",">3 Months Hire");
  scriptProp.setProperty("TIMESTAMP_HEADER","Timestamp");
  scriptProp.setProperty("DATE_HEADER","Date");
  scriptProp.setProperty("MONTH_YEAR_HEADER","Month & Year");
  scriptProp.setProperty("PERC_SCORE_HEADER","% Score");
  scriptProp.setProperty("SUBMISSION_SHEET_NAME","'Call Scorecard Form Responses'");
  scriptProp.setProperty("FILED_TICKET_HEADER","Did the agent file/document a ticket to record this interaction with the caller?");
  scriptProp.setProperty("BUSINESS_INFO_ACCORDINGLY_HEADER", "Did the agent fill out the business information accordingly?");
  scriptProp.setProperty("CALLER_NAME_HEADER", "Caller's Name");
  scriptProp.setProperty("CALLER_POSITION_HEADER", "Caller's Position");
  scriptProp.setProperty("CALLER_PHONE_HEADER", "Caller's Phone#");
  scriptProp.setProperty("CALLER_EMAIL_HEADER", "Caller's Email");
  scriptProp.setProperty("SUBJECT_HEADER", "Subject");
  scriptProp.setProperty("PROBLEM_DESCRIPTION_HEADER", "Problem Description");
  scriptProp.setProperty("ACTION_PLAN_HEADER", "Action Plan");
  scriptProp.setProperty("SOLUTION_HEADER", "Solution");
  scriptProp.setProperty("DESCRIPTION_HEADER", "Description");
  scriptProp.setProperty("INTERNAL_NOTES_HEADER", "Internal Notes");
  scriptProp.setProperty("SECURITY_HEADER", "Did the agent adhere to all account security guidelines during the call?");
  scriptProp.setProperty("WORK_AVOIDANCE_HEADER","Did the agent work efficiently?");
}