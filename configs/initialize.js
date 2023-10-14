function initializeLastRow() {
  // const submSheet = SpreadsheetApp.openById(BACKEND_ID).getSheetByName("Submissions");
  scriptProps.setProperty("lr",(4682).toString()); // change number to the last row you want to do. 
}

// /**
//  * row 1576 shows an example of the race condition of using a form submit with a getLastRow() 
//  */

function initializeFormTrigger(){
  const form = FormApp.openById("1imwmnGELgUAelDO1p6qRbXF5uw3AaP1_dyKj5xO5qkw")
  ScriptApp.newTrigger("mainWrapper")
    .forForm(form)
    .onFormSubmit()
    .create();
}

function setScriptProperties(){
  
  // if in production, this should be true
  scriptProps.setProperty("IS_PRODUCTION","true");
  scriptProps.setProperty("IS_CALL","false");
  // this will depend on chat or call schema/headers
  scriptProps.setProperty("DATE_SENT_HEADER","Date Sent");
  scriptProps.setProperty("TRANSCRIPT_ID_HEADER","Chat Transcript Segment ID#");
  scriptProps.setProperty("TICKET_HEADER","Ticket #");
  scriptProps.setProperty("AGENT_NAME","Agent Name");
  scriptProps.setProperty("EMAIL_SENT","Email Sent");
  scriptProps.setProperty("SCORE_HEADER","Score");
  scriptProps.setProperty("AGENT_LOCATION","Agent Location");
  scriptProps.setProperty("TEAM_HEADER","Team");
  scriptProps.setProperty("CC_EMAIL_HEADER","CC Email");
  scriptProps.setProperty("HIRE_DATE_HEADER","Hire Date");
  scriptProps.setProperty("<3_MONTHS_HEADER","<3 Months Hire");
  scriptProps.setProperty(">3_MONTHS_HEADER",">3 Months Hire");
  scriptProps.setProperty("TIMESTAMP_HEADER","Timestamp");
  scriptProps.setProperty("DATE_HEADER","Date");
  scriptProps.setProperty("MONTH_YEAR_HEADER","Month & Year");
  scriptProps.setProperty("PERC_SCORE_HEADER","% Score");
  scriptProps.setProperty("SUBMISSION_SHEET_NAME","'Chat Form Responses'");
  
  // coaching status header/field on form sheet
  scriptProps.setProperty("Coaching Status","Copied to coaching form? And when");
  
  // criteria fields/headers
  scriptProps.setProperty("SECURITY_HEADER", "Did the agent adhere to all account security guidelines while assisting the merchant?");
  scriptProps.setProperty("FILED_TICKET_HEADER","Did the agent file/document a ticket to record this interaction with the chatter?");
  scriptProps.setProperty("WORK_AVOIDANCE_HEADER","Did the agent work efficiently? ");
  scriptProps.setProperty("EVALUATOR_HEADER","Evaluator Name");
  scriptProps.setProperty("MID_DBA_HEADER","MID & DBA Name");
  
  // All these need to be granted permissions if you want to run the script
  scriptProps.setProperty("Response Sheet Name","Chat Form Responses");
  scriptProps.setProperty("BACKEND_ID","1a36JwaGQAgUWs-Pa6dkM6XfmiaJVyCiXlt9vZeLL6e4");
  scriptProps.setProperty("REPORTING_ID","1zQ98-rxOzfeq1QOmVeaC7OgOcZ0IaD7vv7_Vak7rclE");
  // reliability coaching reporting
  scriptProps.setProperty("REPORTING_SS_ID","1-h8et_sdVVSmUbKq-ZK86-K93VRyX80xW2r2fgmIIhQ");
  
  scriptProps.setProperty("REPORTING_SHEET_NAME","Coaching_Form_Data");
}