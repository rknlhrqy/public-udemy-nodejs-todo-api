
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
  if (error) {
    console.log('Unable to connect to Mongo DB server');
  } else {
    console.log('Connected to Mongo DB server');
    const db = client.db('TodoApp');

    db.collection('Todos').findOneAndUpdate(
      {_id: new ObjectID('5b46cd2a55b41bf9f396d08e')},
      {$set: {completed: true}},
      {returnOriginal: false}
    ).then((doc) => {
       console.log(doc);
    });

    db.collection('Users').findOneAndUpdate(
      {_id: new ObjectID('5b46d1ab55b41bf9f396d314')},
      {$set:{name: 'Hong'}, $inc:{age: -1}},
      {returnOriginal: false}
    ).then((doc) => {
      console.log(doc);
    });

    client.close();
  }
})