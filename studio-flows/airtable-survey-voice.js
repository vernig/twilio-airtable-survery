/**
 *
 * @param {Object} configuration :
 *    JSON with following keys:
 *      ServerlessBase: Base url for serverless, e.g. https://twilio-airtable-survey-xxxx-dev.twil.io
 *
 */

module.exports = function AirtableSurveyVoiceDefinition(configuration) {
  return {
    description: 'airtable-survey-voice',
    states: [
      {
        name: 'Trigger',
        type: 'trigger',
        transitions: [
          {
            event: 'incomingMessage',
          },
          {
            next: 'setQuestion',
            event: 'incomingCall',
          },
          {
            next: 'callUser',
            event: 'incomingRequest',
          },
        ],
        properties: {
          offset: {
            x: 0,
            y: 0,
          },
        },
      },
      {
        name: 'fetchNextQuestion',
        type: 'make-http-request',
        transitions: [
          {
            next: 'checkNextQuestion',
            event: 'success',
          },
          {
            event: 'failed',
          },
        ],
        properties: {
          offset: {
            x: 70,
            y: 800,
          },
          method: 'POST',
          content_type: 'application/x-www-form-urlencoded;charset=utf-8',
          parameters: [
            {
              value: '{{flow.variables.nextQuestion}}',
              key: 'question',
            },
          ],
          url: `${configuration.ServerlessBase}/fetch-questions`,
        },
      },
      {
        name: 'storeAnswer',
        type: 'make-http-request',
        transitions: [
          {
            next: 'setNextQuestion',
            event: 'success',
          },
          {
            event: 'failed',
          },
        ],
        properties: {
          offset: {
            x: 1030,
            y: 1270,
          },
          method: 'POST',
          content_type: 'application/x-www-form-urlencoded;charset=utf-8',
          parameters: [
            {
              value: '{{contact.channel.address}}',
              key: 'phoneNo',
            },
            {
              value: '{{widgets.fetchNextQuestion.parsed.text}}',
              key: 'question',
            },
            {
              value: '{{widgets.askQuestion.SpeechResult}}',
              key: 'answer',
            },
          ],
          url: `${configuration.ServerlessBase}/store-answer`,
        },
      },
      {
        name: 'checkNextQuestion',
        type: 'split-based-on',
        transitions: [
          {
            next: 'askQuestion',
            event: 'noMatch',
          },
          {
            next: 'goodBye',
            event: 'match',
            conditions: [
              {
                friendly_name: 'lastQuestion',
                arguments: ['{{widgets.fetchNextQuestion.parsed.last}}'],
                type: 'equal_to',
                value: 'true',
              },
            ],
          },
        ],
        properties: {
          input: '{{widgets.fetchNextQuestion.parsed.last}}',
          offset: {
            x: 100,
            y: 1040,
          },
        },
      },
      {
        name: 'setQuestion',
        type: 'set-variables',
        transitions: [
          {
            next: 'fetchNextQuestion',
            event: 'next',
          },
        ],
        properties: {
          variables: [
            {
              value: '0',
              key: 'nextQuestion',
            },
          ],
          offset: {
            x: 90,
            y: 580,
          },
        },
      },
      {
        name: 'setNextQuestion',
        type: 'set-variables',
        transitions: [
          {
            next: 'fetchNextQuestion',
            event: 'next',
          },
        ],
        properties: {
          variables: [
            {
              value: '{{flow.variables.nextQuestion | plus: 1}}',
              key: 'nextQuestion',
            },
          ],
          offset: {
            x: 1140,
            y: 810,
          },
        },
      },
      {
        name: 'callUser',
        type: 'make-outgoing-call-v2',
        transitions: [
          {
            next: 'setQuestion',
            event: 'answered',
          },
          {
            event: 'busy',
          },
          {
            event: 'noAnswer',
          },
          {
            event: 'failed',
          },
        ],
        properties: {
          machine_detection_speech_threshold: '2400',
          detect_answering_machine: false,
          offset: {
            x: 410,
            y: 290,
          },
          recording_channels: 'mono',
          timeout: 60,
          machine_detection: 'Enable',
          trim: 'do-not-trim',
          record: false,
          machine_detection_speech_end_threshold: '1200',
          machine_detection_timeout: '30',
          from: '{{flow.channel.address}}',
          to: '{{contact.channel.address}}',
          machine_detection_silence_timeout: '5000',
        },
      },
      {
        name: 'askQuestion',
        type: 'add-twiml-redirect',
        transitions: [
          {
            next: 'checkSpeechResult',
            event: 'return',
          },
          {
            event: 'timeout',
          },
          {
            event: 'fail',
          },
        ],
        properties: {
          offset: {
            x: 450,
            y: 1370,
          },
          method: 'POST',
          url: `${configuration.ServerlessBase}/gather?question={{widgets.fetchNextQuestion.parsed.text | url_encode}}&flowsid={{flow.flow_sid}}&language={{widgets.fetchNextQuestion.parsed.language | url_encode}}`,
          timeout: '14400',
        },
      },
      {
        name: 'checkSpeechResult',
        type: 'split-based-on',
        transitions: [
          {
            next: 'storeAnswer',
            event: 'noMatch',
          },
          {
            next: 'askQuestion',
            event: 'match',
            conditions: [
              {
                friendly_name: 'blank',
                arguments: ['{{widgets.askQuestion.SpeechResult}}'],
                type: 'is_blank',
                value: 'Is Blank',
              },
            ],
          },
        ],
        properties: {
          input: '{{widgets.askQuestion.SpeechResult}}',
          offset: {
            x: 460,
            y: 1640,
          },
        },
      },
      {
        name: 'goodBye',
        type: 'add-twiml-redirect',
        transitions: [
          {
            event: 'return',
          },
          {
            event: 'timeout',
          },
          {
            event: 'fail',
          },
        ],
        properties: {
          offset: {
            x: -90,
            y: 1410,
          },
          method: 'GET',
          url: `${configuration.ServerlessBase}/say?say={{widgets.fetchNextQuestion.parsed.text | url_encode}}&language={{widgets.fetchNextQuestion.parsed.language | url_encode}}&flowsid={{flow.flow_sid}}`,
          timeout: '14400',
        },
      },
    ],
    initial_state: 'Trigger',
    flags: {
      allow_concurrent_calls: true,
    },
  };
};
