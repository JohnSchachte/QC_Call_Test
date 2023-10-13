/**
 * Class for sending evaluation emails to agents.
 * @class
 */
class DoEmails{
  /**
   * Creates a new DoEmails instance.
   * @constructor
   */
  constructor(){
    this.htmlTemplate = HtmlService.createTemplateFromFile("HTML/agent_notification"); // Create html template from emailTemplate.html file
    this.removeCols = new Set(["Resolution Outcome","How would you rate your experience on this call/chat if you were the customer? ","Agent Department","Date","Month & Year","% Score","Email Sent","Date Sent", "Agent Location","Team","Agents Department","CC Email", "Ticket#","Score %","Score",">3 Months Hire"," ","<90 Day Hire","Hire Date","Dispute Status","Copied to coaching form? And when"]);
    this.emailSubject = IS_CALL == "true" ? `Call Evaluation for ` : `Chat Evaluation for `; // Set email subject to Quality Evalutation form with agent name
  }

  /**
   * Send an email based on the provided data.
   * @param {Array} row - The row data.
   * @param {Map} colMap - A map relating column names to their indices.
   * @param {Object} agentObj - Object containing agent's data.
   * @param {number} score - The agent's score.
   * @param {Array} updateValues - Array containing values to update.
   */
  send(row,colMap,agentObj,score,updateValues){
    let emailOptions = {};

    // format transcript ids
    let transcriptIds = transformTranscriptIds(row[colMap.get(TRANSCRIPT_ID_HEADER)]);
    if(!transcriptIds){
      updateValues[colMap.get(EMAIL_SENT_HEADER)] = "No Transcript Id";
      return;
    }

    this.htmlTemplate.transcriptIds = transcriptIds;
    this.htmlTemplate.IS_CALL = IS_CALL;
    const ticketNumber = row[colMap.get(TICKET_HEADER)];
    // format ticketLinks
    this.htmlTemplate.ticketLink = (/\d{7}/g).test(ticketNumber) ? ticketNumber.match((/\d{7}/g)).map(el => {return {"id" : el, "url" : "https://tickets.shift4.com/#/tickets/"+el}}) : ["No Ticket Link"]; // test if there is a ticket number. if yes then assign an object. otherwise no ticket.

     // Set employeeName in emailTemplate.html to agentSup
    this.htmlTemplate.employeeName = agentObj["Employee Name"].toUpperCase();

     // Set emailArray in emailTemplate.html to emailArray
    this.htmlTemplate.emailArray = this.mkEmailArray(row,colMap,score);

    emailOptions["htmlBody"] = this.htmlTemplate.evaluate().getContent(); //assigning the template to the email to be sent
    
    if(IS_PRODUCTION == "false") GmailApp.sendEmail( "jschachte@shift4.com",this.emailSubject+row[colMap.get(AGENT_NAME_HEADER)],'',emailOptions);
    
    const cc = this.updateCC(agentObj["Sup_Email"],agentObj["Manager_Email"]); // adds cc and updates the updateValues
    if(cc){
      emailOptions["cc"] = cc;
      updateValues[colMap.get(CC_EMAIL_HEADER)] = cc;
    }else{
      updateValues[colMap.get(CC_EMAIL_HEADER)] = "No CC";
    }

    if(IS_PRODUCTION == "true") GmailApp.sendEmail(agentObj["Email Address"],this.emailSubject+row[colMap.get(AGENT_NAME_HEADER)],'',emailOptions); // send to the agent's email with CC's
    updateValues[colMap.get(EMAIL_SENT_HEADER)] = "Sent";
    updateValues[colMap.get(DATE_SENT_HEADER)] = new Date().toLocaleString();
  }

 /**
   * Create an array structure for email content.
   * @param {Array} row - The row data.
   * @param {Map} colMap - A map relating column names to their indices.
   * @param {number} score - The agent's score.
   * @returns {Array} An array of key-value pairs for email content.
   */
  mkEmailArray(row,colMap,score){
    let emailArray = [
      ["Score", (score / 100).toString()+"%"],
    ]; 
    colMap.forEach((value,key) => {
      if(key && row[value] && !this.removeCols.has(key) && !key.includes("Removed ")){
        emailArray.push([key,row[value]])
      }
    });
    return emailArray;
  }
  /**
   * Determine the CC recipients for the email based on supervisor and manager emails.
   * @param {string} supEmail - The supervisor's email address.
   * @param {string} managerEmail - The manager's email address.
   * @returns {string} The CC recipients for the email.
   */
  updateCC(supEmail,managerEmail){
    // Obj ect with email options
    return supEmail || managerEmail || "";
  }
}
