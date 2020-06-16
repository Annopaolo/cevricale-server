const express = require('express')
const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const port = 3000

const wrapper = require('./dbWrapper.js')
const crypto = require('./crypto.js')

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/therapist/:id', (req, res) => {
  //console.log(req.params.id);
  wrapper.getActivities(req.params.id, res)
})

app.post('/login', (req, res) => {
  const uid = req.body.id;
  const psw = req.body.psw;
  wrapper.checkCredentials(uid,psw, res);
})


app.get('/user', (req, res) => res.send('Hello, patient!'))

app.post('/', (req,res) => {
  wrapper.postActivity(req.body);
  res.send("Ok!\n")
})

app.post('/newUser', (req,res) => {
  const name = req.body.name;
  const psw = req.body.psw;
  wrapper.postTherapist(name, psw);
  res.send("Ok!\n")
})

app.post('/newWatch', (req,res) => {
  const uid = req.body.uid;
  const thid = req.body.thid;
  wrapper.postWatching(uid, thid);
  res.send("Ok!\n")
})


app.listen(port, console.log(`Example app listening at http://localhost:${port}`))
