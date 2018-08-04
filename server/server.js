require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate, generateNewToken, loginAuthenticate} = require('./middleware/authenticate');

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, async (request, response) => {
  const todo = new Todo({
    text: request.body.text,
    completed: request.body.completed,
    completedAt: request.body.completedAt,
    _creator: request.user._id
  });
  try {
    const doc = await todo.save();
    response.send(doc);
  } catch (error) {
    response.status(400).send(error);
  };
});

app.get('/todos', authenticate, async (request, response) => {
  try {
    const todos = await Todo.find({_creator: request.user._id});
    response.send({todos});
  } catch (error) {
    response.status(too).send(error);
  };
});

app.get('/todos/:my_id', authenticate, async (request, response) => {
  const id = request.params.my_id;
  if (!ObjectID.isValid(id)) {
    response.status(404).send({error: `ID ${id} not valid!`});
  } else {
    try {
      const doc = await Todo.findOne({_id: id, _creator: request.user._id});
      if (doc) {
        response.status(200).send({doc});
      } else {
        response.status(404).send({
          error: `fail to locate ID ${id}!`
        });
      }
    } catch (error) {
      response.status(404).send(error);
    };
  }
});

app.delete('/todos/:my_id', authenticate, async (request, response) => {
  const id = request.params.my_id;

  if(!ObjectID.isValid(id)) {
    response.status(404).send({error: `ID ${id} not valid!`});
  } else {
    try {
      const doc = await Todo.findOneAndRemove({
        _id: id,
        _creator: request.user._id});
      if (doc) {
        response.status(200).send({doc});
      } else {
        response.status(404).send({error: `fail to locate ID ${id}`});
      }
    } catch (error) {
      response.status(400).send({
        error: 'Cannot connect to Mongo DB'
      });
    };
  } 
});

app.patch('/todos/:my_id', authenticate, async (request, response) => {
  const id = request.params.my_id;
  let body = _.pick(request.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    response.status(404).send({error: `ID ${id} is not valid!`});
  } else {
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    try {
      const doc = await Todo.findOneAndUpdate(
        {_id: id, _creator: request.user._id},
        {$set: body},
        {new: true});
        if(!doc) {
          response.status(404).send({error: `ID ${id} cannot be located!`});
        } else {
          response.status(200).send({doc});
        }
    } catch(error) {
      response.statue(400).send({error: `connect update Mongo DB for ID ${id}`});
    };
  }
});


app.post('/users', async (request, response) => {
  let body = _.pick(request.body, ['email','password']);
  const user = new User(body);

  try {
    const token = await user.generateAuthToken();
    if (token) {
      response.header('x-auth', token).send(user);
    } else {
      response.status(400).send({error: 'Unable to save the user'});
    }
  } catch(error) {
    response.status(400).send(error);
  };
});

app.get('/users', async (request, response) => {
  try {
    const users = await User.find();
    response.send({users});
  } catch(error) {
    response.status(400).send(error);
  };
});

//Private routing
app.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
});

// Post /users/login {email, password}
app.post('/users/login', loginAuthenticate, (request, response)=>{
  if (response.locals.token && response.locals.user) {
    response.header( 'x-auth', response.locals.token).send(response.locals.user); 
  }
});

app.delete('/users/me/token', authenticate, async (request, response) => {
  try {
    await request.user.removeToken(request.token);
    response.status(200).send(doc);
  } catch(error) {
    response.status(400).send(error);
  }
});


app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
