const Airtable = require('airtable');

exports.handler = function (context, event, callback) {
  const questionNo = parseInt(event.question) || 0;

  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE_ID);

  base(process.env.AIRTABLE_QUESTIONS_TABLE)
    .select({ view: 'Grid view' })
    .firstPage((err, records) => {
      if (err) {
        console.log(err.toString());
        callback(500, null);
      }
      if (questionNo >= records.length) {
        callback(null, '');
      } else {
        let question = {
          text: records[questionNo].get('Question Text'),
          language: records[questionNo].get('Language'),
          last: (questionNo === records.length - 1),
        };
        callback(null, question);
      }
    });
};
