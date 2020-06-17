const express = require('express')
var bodyParser = require('body-parser');
const app = express()

const port = 3000

//const wrapper = require('./dbWrapper.js')
const crypto = require('./crypto.js')

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const connectionUrl = "mongodb+srv://Annopaolo:I6CKXf5GeSkWu0H6@cluster0-fhh1o.mongodb.net/test?retryWrites=true&w=majority"
// Database Name
const dbName = 'cevricale-db';

MongoClient.connect(connectionUrl, { useUnifiedTopology: true })
  .then(client => {
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


    const db = client.db(dbName)

    app.get('/', (req, res) => {
      crypto.enc('Hello World!', res)
    })

    app.get('/therapist/:id', (req, res) => {
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
          res.send("ok!");
        } else {
           res.status(403).send({ error: 'Forbidden!' });
        }
      })
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

    app.post('/', (req,res) => {
      const activities = db.collection("activities");
      activities.insertOne({uid : req.uid, scene: req.scene, time: req.time, metric: req.metric, pain: req.pain, satisfaction: req.satisfaction});
      res.send("Ok!\n")
    })

  app.post('/newWatch', (req,res) => {
    const uid = req.body.uid;
    const thid = req.body.thid;
    const watching = db.collection("watching");
    watching.insertOne({userId :uid, therapistId: thid});
    res.send("Ok!\n")
  })

    app.get('/user', (req, res) => res.send('Hello, patient!'))

    app.listen(port, console.log(`Example app listening at http://localhost:${port}`))


  })
  .catch(console.error)
