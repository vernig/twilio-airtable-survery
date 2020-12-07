// parseFile() and createOutput() taken from https://www.npmjs.com/package/configure-env

const Inquirer = require('inquirer');

function parseFile(fileName) {
  const fs = require('fs');
  const fileContent = fs.readFileSync(fileName, 'utf-8');

  const lines = fileContent.split('\n');
  const variablesToSet = [];
  const linesForTemplate = [];
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1];
    linesForTemplate.push(currentLine);
    if (
      currentLine.startsWith('#') &&
      typeof nextLine === 'string' &&
      nextLine.includes('=')
    ) {
      const comment = currentLine.replace('#', '').trim();
      let [name, defaultValue] = nextLine.trim().split('=');
      name = name.trim();
      if (typeof defaultValue === 'string') {
        defaultValue = defaultValue.trim();
      }
      variablesToSet.push({
        name,
        comment,
        defaultValue: defaultValue || undefined,
      });
      linesForTemplate.push(`${name}={{${name}}}`);
      i++;
    }
  }
  return { variablesToSet, outputTemplate: linesForTemplate.join('\n') };
}

function createOutput(parsedExample, answers) {
  let output = parsedExample.outputTemplate;
  for (let variableToSet of parsedExample.variablesToSet) {
    let value = answers[variableToSet.name];
    if (value) {
      if (value.indexOf(' ') === -1) {
        value = `${value.replace(/"/g, '')}`;
      } else {
        value = `"${value.replace(/"/g, '')}"`;
      }
    } else {
      value = '';
    }
    output = output.replace(`{{${variableToSet.name}}}`, value);
  }
  return output;
}

function configureEnv(envFileName) {
  const fs = require('fs');
  let fileName = `${envFileName}.template`;
  if (fs.existsSync(envFileName)) {
    fileName = envFileName;
  }

  envFile = parseFile(fileName);
  return Inquirer.prompt(
    envFile.variablesToSet.map((variable) => {
      return {
        type: 'string',
        name: variable.name,
        message: variable.comment,
        default: variable.defaultValue,
      };
    })
  ).then((answers) => {
    fs.writeFileSync('.env', createOutput(envFile, answers), 'utf8');
    return Promise.resolve(answers);
  });
}

module.exports = configureEnv;
