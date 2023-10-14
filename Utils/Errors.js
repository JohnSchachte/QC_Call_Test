class HTTPError extends Error {
    constructor(message) {
      super(message); // Call the parent class's constructor
      this.name = 'AgentObjectError'; // Set the name of the error
    }
  }

class CoachingIdNull extends Error {
    constructor(message) {
      super(message); // Call the parent class's constructor
      this.name = 'CoachingIdNull'; // Set the name of the error
    }
  }