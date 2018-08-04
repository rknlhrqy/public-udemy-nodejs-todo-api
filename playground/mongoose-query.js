const {ObjectID} = require('mongodb');
const {mongoose} = require('mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');
/*
const id = '5b476855d04b6f48f1b1165f';

if (!ObjectID.isValid(id)) {
  console.log('Error: ID is not valid');
}

Todo.find({
  _id: id
}).then((todos) => {
  if (todos.length) {
    console.log(JSON.stringify(todos, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  }
}).catch((error) => {
  console.log(error);
});

Todo.findOne({
  _id: id
}).then((todo) => {
  if (todo) {
    console.log(JSON.stringify(todo, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  }
}).catch((error) => {
  console.log(error);
});

Todo.findById(id).then((todo) => {
  if (todo) {
    console.log(JSON.stringify(todo, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  }
}).catch((error) => {
  console.log(error);
});
*/
const id2 = '5b479d4044c63e5aaca86e77';

if (!ObjectID.isValid(id2)) {
  console.log('Error: ID is not valid');
}

User.find({
   _id: id2
}).then((users) => {
  if (users.length) {
    console.log(JSON.stringify(users, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  }
}, (error) => {
  console.log(error);
});

User.findOne({
  _id: id2
}).then((user) => {
  if (user) {
    console.log(JSON.stringify(user, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  }
}, (error) => {
  console.log(error);
});

User.findById(id2).then((user) => {
  if (user) {
    console.log(JSON.stringify(user, undefined, 2));
  } else {
    console.log('Unable to find document from Mongo DB');
  } 
}, (error) => {
  console.log((error));
});


