const configureEnv = require('./provision-helpers/configure-env');
const {
  initServerless,
  deployServerless,
} = require('./provision-helpers/twilio-serverless');
const ora = require('ora');

const ServiceName = 'twilio-airtable-survey';
const Stage = 'dev';

var envVariables;
var twilioClient;
var spinner;

configureEnv('.env')
  .then((answers) => {
    envVariables = answers;
    spinner = ora('Initalizing Serverless service').start();
    return initServerless(
      envVariables.ACCOUNT_SID,
      envVariables.AUTH_TOKEN,
      ServiceName,
      Stage
    );
  })
  .then((environment) => {
    spinner.succeed();
    envVariables.domain = `https://${environment['domain_name']}`;
    spinner = ora('Deploying Serverless').start();
    return deployServerless(
      envVariables.ACCOUNT_SID,
      envVariables.AUTH_TOKEN,
      ServiceName,
      Stage
    );
  })
  .then((buildInfo) => {
    spinner.succeed();
    twilioClient = require('twilio')(
      envVariables.ACCOUNT_SID,
      envVariables.AUTH_TOKEN
    );
    spinner = ora('Deploying Studio Flows').start();
    return twilioClient.studio.flows.create({
      commitMessage: 'First version',
      friendlyName: 'Airtable SMS Survey',
      status: 'published',
      definition: require('./studio-flows/airtable-survey-sms')({
        ServerlessBase: envVariables.domain,
      }),
    });
  })
  .then(() => {
    return twilioClient.studio.flows.create({
      commitMessage: 'First version',
      friendlyName: 'Airtable Voice Survey',
      status: 'published',
      definition: require('./studio-flows/airtable-survey-voice')({
        ServerlessBase: envVariables.domain,
      }),
    });
  })
  .then(() => {
    spinner.succeed();
    console.log('Enjoy!');
  })
  .catch((error) => {
    if (spinner) {
      spinner.fail();
    }
    console.error(error);
  });
