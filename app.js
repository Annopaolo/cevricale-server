var fs = require('fs')
const express = require('express')
var bodyParser = require('body-parser');
path = require('path'); //needed by sendFile
var _ = require('lodash');


const app = express()

const port = 3000

//const wrapper = require('./dbWrapper.js')
const crypto = require('./crypto.js')

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const connectionUrl = fs.readFileSync(".db-instructions", 'utf8');

// Database Name
const dbName = 'cevricale-db';

var loggedTherapist = [];

MongoClient.connect(connectionUrl, { useUnifiedTopology: true })
  .then(client => {
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


    const db = client.db(dbName)

    app.get('/', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.sendFile(path.join(__dirname + '/client/html/index.html'));
    })
    app.get('/js/index.js', (req, res) => res.sendFile(path.join(__dirname + '/client/js/index.js'))) //mandare il js della pagina client
    app.get('/css/index.css', (req, res) => res.sendFile(path.join(__dirname + '/client/css/index.css'))) //mandare il css della pagina client

    app.get('/therapist/:id', (req, res) => {
      if (!_.includes(loggedTherapist, req.params.id)){
        res.status(403).send({ error: 'Not allowed, try to login first' });
      }
      const activities = db.collection("activities");
      const watching = db.collection("watching");
      activities.aggregate([
        {
          $lookup:
          {
            from: "watching",
            localField: "uid",
            foreignField: "userId",
            as: "associated_therapist"
          }
        },
        {
          $unwind:
          {
            path: "$associated_therapist",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $match:
          {
            "associated_therapist.therapistId" : req.params.id
          }
        }
      ]).toArray().then(result => {res.send(result);})
    })

    app.post('/login', (req, res) => {
      const uid = req.body.name;
      const psw = req.body.psw;
      const therapist = db.collection("therapist");
      const cursor = therapist.find({usn : uid}).toArray()
      .then( (result) => {
        if (result != "" && crypto.decSync(result[0].psw) == psw){
          loggedTherapist = _.concat(loggedTherapist, uid);
          res.send("ok!");
        } else {
           res.status(403).send({ error: 'Forbidden!' });
        }
      })
    })

    app.post('/logout', (req, res) => {
      const uid = req.body.name;
      if (!_.includes(loggedTherapist, uid)){
        res.status(403).send({ error: 'Not allowed, try to login first' });
      } else {
        loggedTherapist = _.remove(loggedTherapist, (o) => (o != uid));
        res.send("Ok!\n");
      }
    })

    app.post('/newTherapist', (req,res) => {
      const name = req.body.name;
      const psw = req.body.psw;
      const therapist = db.collection("therapist");
      therapist.find({usn: name}).toArray()
      .then( (result) => {
        if (result == "") {
          therapist.insertOne({usn: name, psw: crypto.encSync(psw)});
          res.send("ok!");
        } else {
          res.status(400).send({ error: 'Username already taken!' });
        }
    })})

    app.post('/newActivity', (req,res) => {
      const activities = db.collection("activities");
      activities.insertOne({uid : req.body.uid, scene: req.body.scene, time: req.body.time, metric: req.body.metric, pain: req.body.pain, satisfaction: req.body.satisfaction, date: Date.now()});
      res.send("Ok!\n")
    })

    app.post('/newWatch', (req,res) => {
    const uid = req.body.uid;
    const thid = req.body.thid;
    if (!_.includes(loggedTherapist, thid)){
        res.status(403).send({ error: 'Not allowed, try to login first' });
    } else {
      const watching = db.collection("watching");
      watching.insertOne({userId :uid, therapistId: thid});
      res.send("Ok!\n");
    }
  })

    app.get('/user', (req, res) => res.send('Hello, patient!'))


    // https.createServer(
    //   {
    //   key: fs.readFileSync('./server.key'),
    //   cert: fs.readFileSync('./server.cert'),
    //   passphrase: `something`
    //   },
    //app
    // )
    //.listen(port,console.log(`App listening at http://localhost:${port}`));
    app.listen(port, console.log(`App listening at http://localhost:${port}`))

  })
  .catch(console.error)
