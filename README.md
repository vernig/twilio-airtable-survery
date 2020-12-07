# Dynamic SMS/Voice Survey using Airtable

This repo shows how to create a multilingual voice and SMS survey with questions and answers stored in an airtable base. 

## Pre-Requisite 
* A Twilio account
* An airtable account with one base containing: 
  * One table for questions. This table needs to have two columns:
    * `Question Text` (single line of text): the actual question
    * `Language` (single line of text): language code using one of the following [this language tags](https://www.twilio.com/docs/voice/twiml/gather#languagetags). This is used to generate the Text-To-Speech in the correct language and to apply the correct language for Speech-To-Text. This is not used for SMS Survey 
  * One (empty) table for answers. This table should have thre columns (self explanatory): 
    * `Number` (single line of text)
    * `Question` (single line of text)
    * `Answer` (single line of text)

## Set-up 
* Clone the repo 
* Install dependencies
```
npm install
```
* Run the provision script
```
node provision
```
* At the end of the process you should have two new Studio Flows created: 
  * `Airtable SMS Survey`
  * `Airtable Voice Survey`
* In your Twilio console, set the two flows for `When a call coms in` and `When a message comes in` for the number you want to run the surveys from

To test then, trigger the Studio Flow providing `from` abd `to` number. More instructions on how to trigger a flow can be found [here](https://support.twilio.com/hc/en-us/articles/360007778153-Trigger-a-Twilio-Studio-Flow-Execution-via-the-REST-API)