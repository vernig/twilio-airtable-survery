exports.handler = function (context, event, callback) {
  let twiml = new Twilio.twiml.VoiceResponse();
  let gather = twiml.gather({
    input: 'speech',
    timeout: '3',
    language: event.language || 'en-US',
    action: `https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${event.flowsid}?FlowEvent=return`
  });
  gather.say(
    {
      language: event.language || 'en-US',
    },
    event.question
  );
  twiml.redirect(`https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${event.flowsid}?FlowEvent=return&SpeechResult=`)
  callback(null, twiml)
};
