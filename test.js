const twilio = require('twilio');

// Twilio credentials (found in your Twilio dashboard)
const accountSid = 'AC4c8b35004602d63d94e190dfdaf00618';
const authToken = 'ed68d88215b51cd0e848249eebd9083e';
const client = twilio(accountSid, authToken);

// Initiate a call
client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml', // TwiML URL for the call
    to: '+212684429343', // The recipient's phone number
    from: '+13528300675', // The number you want to display as the caller ID
  })
  .then(call => console.log(`Call initiated with SID: ${call.sid}`))
  .catch(error => console.error('Error initiating call:', error));