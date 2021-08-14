const express = require('express');
const db = require('../database/index.js')
const morgan = require('morgan');
const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

// HAVE TO STRUCTURE DATE

// retrieve a list of questions for a particular product
// REMOVE REPORTED QUESTIONS
app.get('/qa/questions', async (req, res) => {
  let {product_id, page, count} = req.query;
  if (!product_id) {
    res.status(400).send('Error: invalid product_id provided');
  }
  // page default
  if (!page) {
    page = 1;
  }
  // count default
  if (!count) {
    count = 5;
  }
  // USE PAGE AND COUNT CONDITIONALLY

  let results = await db.query(`SELECT id as question_id, body as question_body, date_written as question_date, asker_name, helpful as question_helpfulness, reported FROM questions WHERE product_id = ${product_id}`);
  for (var i = 0; i < results.length; i++) {
    let question_id = results[i].question_id;
    let answers = await db.query(`SELECT id, body, date_written as date, answerer_name, helpful as helpfulness FROM answers WHERE question_id = ${question_id}`);
    if (!answers || !answers.length) {
      results[i].answers = {};
      continue;
    }
    answers = answers[0];
    results[i].answers = {}
    results[i].answers[answers.id] = answers;
    let photos = await db.query(`SELECT url FROM answers_photos WHERE answer_id = ${answers.id}`);
    results[i].answers[answers.id].photos = photos.map(i => i.url);
  }
  let response = {product_id, results};
  res.status(200).send(response);
});

// return answers for a given question
// REMOVE REPORTED ANSWERS
app.get('/qa/questions/:question_id', async (req, res) => {
  // ADD A 400 RESPONSE IF NO QUESTION_ID IS GIVEN

  // USE PAGE AND COUNT CONDITIONALLY
  let {page, count} = req.query;
  if (!page) {
    page = 1;
  }
  if (!count) {
    count = 5;
  }
  let question = req.params.question_id;
  let response = {question, page, count}
  let results = await db.query(`SELECT id as answer_id, body, date_written as date, answerer_name, helpful as helpfulness FROM answers WHERE question_id=${question}`);
  for (var i = 0; i < results.length; i++) {
    let photos = await db.query(`SELECT id, url FROM answers_photos WHERE answer_id=${results[i].answer_id}`);
    results[i].photos = photos
  }
  response['results'] = results;
  res.status(200).send(response);
});




// add a question for the given product
app.post('/qa/questions', (req, res) => {
  let {body, name, email, product_id} = req.body;
  if (!body || !name || !email || !product_id) {
    res.status(400).send('Error: Question body contains invalid entries')
  }
  // db.none(`INSERT INTO questions(product_id, body, asker_name, asker_email) VALUES($1, $2, $3, $4)`, [product_id, body, name, email])
  //   .then(() => {
  //     res.status(200).send('Created');
  //   })
  //   .catch(err => {
  //     console.log(error);
  //     res.send('404');
  //   })
});




// add an answer for the given question
app.post('/qa/questions/:question_id/answers', (req, res) => {
  // question_id (parameter)
  // body, name, email, photos
  res.status(200).send('resopnse from api');
});

app.listen(port, () => {console.log(`Listening at http://localhost:${port}`)})