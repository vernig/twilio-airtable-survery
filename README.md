# Dynamic SMS/Voice Survey using Airtable

This repo shows how to create a multilingual voice and SMS survey with questions and answers stored in an airtable base. 

## Pre-Requisite 
* A Twilio account
* An airtable account with one base containing: 
  * One table for questions. This table needs to have two columns:
    * `Question Text` (single line of text): the actual question
    * `Language` (single line of text): language code using one of the following [language tags](https://www.twilio.com/docs/voice/twiml/gather#languagetags). This is used to generate the Text-To-Speech in the correct language and to apply the correct language for Speech-To-Text. This is not used for SMS Survey 

![image](https://user-images.githubusercontent.com/54728384/101385861-418d9a80-38b4-11eb-8f6b-3f2ec961c7af.png)

  * One (empty) table for answers. This table should have thre columns (self explanatory): 
    * `Number` (single line of text)
    * `Question` (single line of text)
    * `Answer` (single line of text)
    
![image](https://user-images.githubusercontent.com/54728384/101385914-55390100-38b4-11eb-9e63-e730425549b7.png)


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
* Fill-up some questions in the table for questions. The last row on this table is the final greetings, e.g.

![image](https://user-images.githubusercontent.com/54728384/101385703-0f7c3880-38b4-11eb-92a4-15911846c38b.png)

To test them, trigger the Studio Flow providing `from` abd `to` number. More instructions on how to trigger a flow can be found [here](https://support.twilio.com/hc/en-us/articles/360007778153-Trigger-a-Twilio-Studio-Flow-Execution-via-the-REST-API)
