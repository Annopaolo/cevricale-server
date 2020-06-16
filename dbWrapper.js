const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const connectionUrl = "mongodb+srv://Annopaolo:I6CKXf5GeSkWu0H6@cluster0-fhh1o.mongodb.net/test?retryWrites=true&w=majority"
//const connectionUrl = 'mongodb://localhost:27017';
// Database Name
const dbName = 'cevricale-db';

// Use connect method to connect to the Server
const getActivities = (therapistId, response) => MongoClient.connect(connectionUrl, {unifiedTopology: true})
.then(client => {
  console.log("Connected correctly to server");
  const db = client.db(dbName);
  const activities = db.collection("activities");
  const watching = db.collection("watching");
  /*activities.insertMany([
    {uid: "Tel1", scene: "1", time: "1.00", metric: "4", pain: "no", satisfaction: "3", date: "9/11/2001"},
    {uid: "Tel2", scene: "2", time: "1.00", metric: "4", pain: "no", satisfaction: "3", date: "9/11/2001"},
    {uid: "Tel3", scene: "3", time: "1.00", metric: "4", pain: "no", satisfaction: "3", date: "9/11/2001"}
  ]);
  watching.insertMany([
    {thid: "Therapist1", userId: "Tel1"},
    {thid: "Therapist1", userId: "Tel3"},
    {thid: "Therapist2", userId: "Tel2"},
  ]);*/

  db.collection("activities").aggregate([
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
        "associated_therapist.therapistId" : therapistId
      }
    }
  ]).toArray().then(result => {response.send(result);})
});

const checkCredentials = (uid, psw, response) =>MongoClient.connect(connectionUrl, {unifiedTopology: true})
  .then(client => {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const therapist = db.collection("therapist");
      const cursor = therapist.find({usn : uid, psw : psw});
      if (cursor.hasNext()){
        response.send("OK!");
      } else {
         response.status(403).send({ error: 'Forbidden!' });
      }
  })

const postTherapist = (therapistId, therapistPsw) => MongoClient.connect(connectionUrl, {unifiedTopology: true})
  .then(client => {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const therapist = db.collection("therapist");
      therapist.insertOne({usn: therapistId, psw: therapistPsw});
  });

const postActivity = (body) => MongoClient.connect(connectionUrl, {unifiedTopology: true})
  .then(client => {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const activities = db.collection("activities");
      activities.insertOne({uid : body.uid, scene: body.scene, time: body.time, metric: body.metric, pain: body.pain, satisfaction: body.satisfaction});
  }).catch(err => console.log(err));

const postWatching = (uid, thid) => MongoClient.connect(connectionUrl, {unifiedTopology: true})
  .then(client => {
      console.log("Connected correctly to server");
      const db = client.db(dbName);
      const watching = db.collection("watching");
      watching.insertOne({userId :uid, therapistId: thid});
  });


exports.postActivity = postActivity
exports.postTherapist = postTherapist
exports.getActivities = getActivities
exports.postWatching = postWatching
exports.checkCredentials = checkCredentials
