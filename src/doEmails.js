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
   * Send an evaluation email to an agent.
   * @param {Object} row - The row of data to be included in the email.
   * @param {Map} colMap - A map of the column names to their indices.
   * @param {Object} agentObj - An object containing the agent's details.
   * @param {Number} score - The agent's score.
   * @param {Object} updateValues - An object to keep track of updated values.
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
   * Create an array of data to be included in the email.
   * @param {Object} row - The row of data to be included in the email.
   * @param {Map} colMap - A map of the column names to their indices.
   * @param {Number} score - The agent's score.
   * @return {Array} - An array of key-value pairs to be included in the email.
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
   * Update the CC field of the email options and updateValues.
   * @param {string} supEmail - Email of Supervisor.
   * @param {string} managerEmail - Email of Manager.
   * @return {string} - The updated CC field or "" the empty string in none.
  */
  updateCC(supEmail,managerEmail){
    // Obj ect with email options
    return supEmail || managerEmail || "";
  }
}
