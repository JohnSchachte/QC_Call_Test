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
}