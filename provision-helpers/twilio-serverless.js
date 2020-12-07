const {
  api,
  TwilioServerlessApiClient,
} = require('@twilio-labs/serverless-api');
const fs = require('fs');

/**
 * Create a new service and a new environment within it
 *
 * @exports
 * @param {string} accountSid Account SID
 * @param {string} authToken Auth Token
 * @param {string} serviceName Service Name
 * @param {string} suffixName Domain suffix name
 *
 * @returns {Promise<EnvironmentResource>} [EnvironmentResource](https://serverless-api.twilio-labs.com/interfaces/_types_serverless_api_.environmentresource.html)
 */
function initServerless(accountSid, authToken, serviceName, suffixName) {
  const client = new TwilioServerlessApiClient({
    accountSid,
    authToken,
  });

  return api
    .createService(serviceName, client)
    .then((serviceSid) =>
      api.createEnvironmentFromSuffix(suffixName, serviceSid, client)
    )
    .then((environment) => Promise.resolve(environment));
}

function deployServerless(accountSid, authToken, serviceName, env) {
  const client = new TwilioServerlessApiClient({
    accountSid,
    authToken,
  });

  config = {
    cwd: require('path').resolve('.'),
    envPath: require('path').resolve('.env'),
    env,
    pkgJson: JSON.parse(fs.readFileSync('./package.json')),
    serviceName,
    functionsEnv: 'dev',
    overrideExistingService: true,
  };
  return client.deployLocalProject(config).then((buildInfo) => {
    // Write .twilio-functions
    let twilioFunctionsFile = { projects: {} };
    twilioFunctionsFile['projects'][accountSid] = {
      serviceSid: buildInfo.serviceSid,
      latestBuild: buildInfo.buildSid,
    };
    fs.writeFileSync('.twilio-functions', JSON.stringify(twilioFunctionsFile));
    return Promise.resolve(buildInfo)
  });
}

module.exports = { initServerless, deployServerless };
