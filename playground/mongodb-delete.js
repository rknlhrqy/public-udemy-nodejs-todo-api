const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
  if (error) {
    console.log('Unable to connect to Mongo DB server');
  } else {
    console.log('Connected to Mongo DB server');
    const db = client.db('TodoApp');

    //Delete Many
    db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((results) => {
      console.log(results.result.ok?'Deleted':'Unable to delete');
      console.log(`${results.result.n} Deleted`);
    });

    //Delete One
    db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((results) => {
      console.log(results.result.ok?'Deleted':'Unable to delete');
      console.log(`${results.result.n} Deleted`);
    });
    // Find one and delete
    db.collection('Todos').findOneAndDelete({completed: false}).then((docs) => {
      console.log(docs);
    });

    db.collection('Users').deleteMany({name:'Kening'}).then((results)=>{
      console.log(results.result.ok?'Deleted':'Unable to delete');
      console.log(`${results.result.n} Deleted`);
    });

    db.collection('Users').deleteOne({location: 'Atlanta1'}).then((results) => {
      console.log(results.result.ok?'Deleted':'Unable to delete');
      console.log(`${results.result.n} Deleted`);
    });
    db.collection('Users').findOneAndDelete({_id: new ObjectID('5b46d1b055b41bf9f396d318')}).then((docs) => {
      console.log(docs);
    })
    
    client.close();
  }
});