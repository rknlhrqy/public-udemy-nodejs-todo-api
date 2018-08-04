const {MongoClient, ObjectID} = require('mongodb'); 

const obj = new ObjectID();

console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
  if (error) {
    console.log('Unable to connect to MongoDB server');
  } else {
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
      text: 'Something to do',
      completed: false
    }, (error, result) => {
      if (error) {
        console.log('Unable to insert todo', error);
      } else {
        console.log(JSON.stringify(result.ops, undefined, 2));
      }
    });

    db.collection('Users').insertOne({
      name: 'Kening',
      age: 47,
      location: 'Atlanta'
    }, (error, result) => {
      if (error) {
        console.log('Unable to insert user');
      } else {
        console.log(JSON.stringify(result.ops, undefined, 2));
        console.log(result.ops[0]._id.getTimestamp());
      }
    })

    client.close();
  }
});