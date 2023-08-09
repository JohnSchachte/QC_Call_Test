/**
 * Checks if a given timestamp is less than 5 months from a given hire date
 * @param {Date} hireDate - The starting date
 * @param {Date} timestamp - The date to compare to the hire date
 * @returns {boolean} True if the timestamp is less than 5 months from the hire date, false otherwise
 */
function under4Months(hireDate, timestamp) {
  Logger.log("hire date = %s",hireDate);
  Logger.log("timestamp = %s",timestamp);

  let fourMonths = new Date(hireDate.getFullYear(), hireDate.getMonth() + 4, 1); // four months from the hireDate, at start of the month
  return timestamp < fourMonths;
};
