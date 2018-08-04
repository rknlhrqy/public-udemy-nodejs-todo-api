
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
  if (error) {
    console.log('Unable to connect to Mongo DB server');
  } else {
    console.log('Connect to Mongo DB server');
    const db = client.db('TodoApp');

    db.collection('Users').find({name: 'Kening'}).toArray().then((docs) => {
      console.log(JSON.stringify(docs, undefined, 2));
    }, (error) => {
      console.log('Unable to fetch todos', error);
    });

    client.close();
  }
})