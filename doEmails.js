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
    this.htmlTemplate = HtmlService.createTemplateFromFile("agent_notification"); // Create html template from emailTemplate.html file
    this.removeCols = new Set(["Resolution Outcome","How would you rate your experience on this call/chat if you were the customer? ","Agent Department","Date","Month & Year","% Score","Email Sent","Date Sent", "Agent Location","Team","Agents Department","CC Email", "Ticket#","Score %","Score",">3 Months Hire"," ","<90 Day Hire","Hire Date","Dispute Status","Copied to coaching form? And when"]);
    this.emailSubject = `Call Evaluation for `; // Set email subject to Quality Evalutation form with agent name
    this.options = {
      noReply: true,
    };
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
    let emailOptions = { ...this.options }; //shallow copy of object.
    

    // assigning html variables based on form inputs
    this.htmlTemplate.uptivityLink = `https://recordings.shift4.com/MediaPlayer/ExternalCallListPlayer/${row[colMap.get("Record ID")]}/true`
    
    this.htmlTemplate.ticketLink =  (/\d{7}/g).test(row[colMap.get("Ticket#")]) ? row[colMap.get("Ticket#")].match((/\d{7}/g)).map(el => {return {"id" : el, "url" : "https://tickets.shift4.com/#/tickets/"+el}}) : ["No Ticket Link"]; // test if there is a ticket number. if yes then assign an object. otherwise no ticket.

    this.htmlTemplate.employeeName = agentObj["Employee Name"].toUpperCase(); // Set employeeName in emailTemplate.html to agentSup
    this.htmlTemplate.emailArray = this.mkEmailArray(row,colMap,score) // Set emailArray in emailTemplate.html to emailArray
    emailOptions["htmlBody"] = this.htmlTemplate.evaluate().getContent(); //assigning the template to the email to be sent
    
    //GmailApp.sendEmail("jschachte@shift4.com",this.emailSubject+row[colMap.get("Agents Name")],'',emailOptions);
    
    this.updateCC(agentObj,emailOptions,updateValues,colMap); // adds cc and updates the updateValues
    
    GmailApp.sendEmail(agentObj["Email Address"],this.emailSubject+row[colMap.get("Agents Name")],'',emailOptions); // send to the agent's email with CC's
    updateValues[colMap.get("Email Sent")] = "Sent";
    updateValues[colMap.get("Date Sent")] = new Date().toLocaleString();
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
   * @param {Object} agentObj - An object containing the agent's details.
   * @param {Object} emailOptions - The options for the email to be sent.
   * @param {Object} updateValues - An object to keep track of updated values.
   * @param {Map} colMap - A map of the column names to their indices.
   */
  updateCC(agentObj,emailOptions,updateValues,colMap){
    // Obj ect with email options
    if(agentObj["Sup_Email"]){
      // checks if supEmail is a blank string or not
      emailOptions["cc"] = agentObj["Sup_Email"];
      updateValues[colMap.get("CC Email")] = agentObj["Sup_Email"];
    }

    if(!agentObj["Sup_Email"] && agentObj["Manager_Email"]){
      //if no sup email check if manager email
      emailOptions["cc"] = agentObj["Manager_Email"];
      updateValues[colMap.get("CC Email")] = agentObj["Manager_Email"] ;
    }
    if(!agentObj["Sup_Email"] && !agentObj["Manager_Email"]){
      // if neither reach out to rtas
      updateValues[colMap.get("CC Email")] = "No CC";
      // GmailApp.sendEmail("rta@shift4.com","Cannot find Agent's Supervisor or Managers Email","Hello when processing an agent's score evaluation we were not able to find the supervisor's or manager's email. Could you check on this for agent = "+agentName);
    }
  }
}
