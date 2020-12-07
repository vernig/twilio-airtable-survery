/**
 *
 * @param {Object} configuration :
 *    JSON with following keys:
 *      ServerlessBase: Base url for serverless, e.g. https://twilio-airtable-survey-xxxx-dev.twil.io
 *
 */

module.exports = function AirtableSurveyVoiceDefinition (configuration) {
  return {
    description: 'airtable-survey-sms',
    states: [
      {
        name: 'Trigger',
        type: 'trigger',
        transitions: [
          {
            event: 'incomingMessage',
          },
          {
            event: 'incomingCall',
          },
          {
            next: 'setQuestion',
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
            y: 470,
          },
          method: 'POST',
          content_type: 'application/x-www-form-urlencoded;charset=utf-8',
          parameters: [
            {
              value: '{{flow.variables.nextQuestion}}',
              key: 'question',
            },
          ],
          url:
            `${configuration.ServerlessBase}/fetch-questions`,
        },
      },
      {
        name: 'sendQuestion',
        type: 'send-and-wait-for-reply',
        transitions: [
          {
            next: 'storeAnswer',
            event: 'incomingMessage',
          },
          {
            event: 'timeout',
          },
          {
            event: 'deliveryFailure',
          },
        ],
        properties: {
          offset: {
            x: 470,
            y: 990,
          },
          service: '{{trigger.message.InstanceSid}}',
          channel: '{{trigger.message.ChannelSid}}',
          from: '{{flow.channel.address}}',
          body: '{{widgets.fetchNextQuestion.parsed.text}}',
          timeout: '3600',
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
            x: 900,
            y: 990,
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
              value: '{{widgets.sendQuestion.inbound.Body}}',
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
            next: 'sendQuestion',
            event: 'noMatch',
          },
          {
            next: 'good_bye',
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
            x: 60,
            y: 750,
          },
        },
      },
      {
        name: 'good_bye',
        type: 'send-message',
        transitions: [
          {
            event: 'sent',
          },
          {
            event: 'failed',
          },
        ],
        properties: {
          offset: {
            x: -130,
            y: 1060,
          },
          service: '{{trigger.message.InstanceSid}}',
          channel: '{{trigger.message.ChannelSid}}',
          from: '{{flow.channel.address}}',
          to: '{{contact.channel.address}}',
          body: '{{widgets.fetchNextQuestion.parsed.text}}',
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
            x: 70,
            y: 250,
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
            x: 790,
            y: 450,
          },
        },
      },
    ],
    initial_state: 'Trigger',
    flags: {
      allow_concurrent_calls: true,
    },
  };
};
