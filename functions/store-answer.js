const Airtable = require('airtable');
exports.handler = function (context, event, callback) {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE_ID);

  console.log(process.env.AIRTABLE_BASE_ID);
  console.log(process.env.AIRTABLE_ANSWERS_TABLE);

  let fields = {
    Number: event.phoneNo,
    Question: event.question,
    Answer: event.answer,
  };

  console.log(fields);

  base(process.env.AIRTABLE_ANSWERS_TABLE).create(
    [
      {
        fields: fields,
      },
    ],
    (err, record) => {
      if (err) {
        console.log(err);
        callback(500, null);
      } else {
        console.log(JSON.stringify(record))
        callback(null, '');
      }
    }
  );
};
