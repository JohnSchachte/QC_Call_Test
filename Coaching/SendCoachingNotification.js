/**
 * Sends a coaching email to the management with details about an agent's coaching status.
 * 
 * @param {Array} coachingRow - An array containing details of the coaching.
 * @param {Object} agentObject - Object containing agent details.
 * @param {string} [coachingId="test22"] - The unique identifier for the coaching.
 * @returns {void}
 */
function sendManagementCoachingEmail(coachingRow, agentObject, coachingId = "test22") {
  if (!agentObject) {
      return;
  }

  const cache = CacheService.getScriptCache();
  const getTeams = Custom_Utilities.memoize(() => CoachingRequestScripts.getTeams(REPORTING_ID), cache);

  // Try to get the coaching ID anchor, falling back to backend if necessary
  let coachingIdAnchor;
  const teams = getTeams();
  try {
      coachingIdAnchor = CoachingRequestScripts.getSupCoachingSheet(teams, agentObject["Team"], agentObject["SUPERVISOR"]);
  } catch (f) {
      Logger.log("trying to get sup Sheet. Error: %s", f);
      coachingIdAnchor = CoachingRequestScripts.getBackEndNew(teams, agentObject["Team"])
  }

  // Populate email variables based on coaching details
  const emailVars = {
      agentName: agentObject["Employee Name"],
      coachingId,
      supSheet: coachingIdAnchor,
      transcriptIds: transformTranscriptIds(coachingRow[this.coachingHeaders["Coaching Identifier?"]]),
      ticket: coachingRow[this.coachingHeaders["Ticket Link"]] == "No Ticket" ?
          [coachingRow[this.coachingHeaders["Ticket Link"]]] :
          coachingRow[this.coachingHeaders["Ticket Link"]].match(/\d{7}/g).map(el => { return { "id": el, "url": "https://tickets.shift4.com/#/tickets/" + el } }),
      severity: coachingRow[this.coachingHeaders["Severity?"]],
      reason: coachingRow[this.coachingHeaders["Category?"]],
      description: coachingRow[this.coachingHeaders["Describe?"]],
      agentEmail: agentObject["Email Address"]
  };

  // Prepare and send the email with the specified template
  const template = HtmlService.createTemplateFromFile("HTML/agent_coaching");
  template.vars = emailVars;

  sendEmail(CoachingRequestScripts.getEmails(agentObject), "Evaluation Coaching: " + agentObject["Employee Name"], template);
}
