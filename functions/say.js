exports.handler = function (context, event, callback) {
  let twiml = new Twilio.twiml.VoiceResponse();
  twiml.say(
    {
      language: event.language || 'en-US',
    },
    event.say
  )
  twiml.redirect(`https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${event.flowsid}?FlowEvent=return`)
  callback(null, twiml)
};
