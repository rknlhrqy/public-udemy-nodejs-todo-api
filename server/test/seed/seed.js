const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const todosInit = [{
  _id: new ObjectID(),
  text: 'First test',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'third test',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'fourth test',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'fifth test',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'sixth test',
  _creator: userTwoId
}, {
  _id: new ObjectID(),
  text: 'seventh test',
  _creator: userTwoId
}, {
  _id: new ObjectID(),
  text: 'eighth test',
  _creator: userTwoId
}, {
  _id: new ObjectID(),
  text: 'ninth test',
  _creator: userTwoId,
  completed: true,
  completedAt: new Date().getTime()
}, {
  _id: new ObjectID(),
  text: 'tenth test',
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then((docs) => {
    Todo.insertMany(todosInit).then((error, docs) => done());
  }).catch((error) => {
    console.log(error);
    done(error);
  });
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let i = 0;
    let userArray = new Array();
    while(i < users.length) {
      userArray.push(new User(users[i]).save());
      i++;
    }
    return Promise.all(userArray);
  }).then(() => done());
};

module.exports = {
  todosInit,
  users,
  populateTodos,
  populateUsers
}