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

app.post('/todos', authenticate, (request, response) => {
  const todo = new Todo({
    text: request.body.text,
    completed: request.body.completed,
    completedAt: request.body.completedAt,
    _creator: request.user._id
  });
  todo.save().then((doc) => {
    response.send(doc);
  }, (error) => {
    response.status(400).send(error);
  });
});

app.get('/todos', authenticate, (request, response) => {
  Todo.find({_creator: request.user._id}).then((todos) => {
    response.send({todos});
  }, (error) => {
    response.status(too).send(error);
  });
});

app.get('/todos/:my_id', authenticate, (request, response) => {
  const id = request.params.my_id;
  if (!ObjectID.isValid(id)) {
    response.status(404).send({error: `ID ${id} not valid!`});
  } else {
    Todo.findOne({_id: id, _creator: request.user._id}).then((doc) => {
      if (doc) {
        response.status(200).send({doc});
      } else {
        response.status(404).send({
          error: `fail to locate ID ${id}!`
        });
      }
    }, (error) => {
      response.status(404).send(error);
    });
  }
});

app.delete('/todos/:my_id', authenticate, (request, response) => {
  const id = request.params.my_id;

  if(!ObjectID.isValid(id)) {
    response.status(404).send({error: `ID ${id} not valid!`});
  } else {
    Todo.findOneAndRemove({
      _id: id,
      _creator: request.user._id
    }).then((doc) => {
      if (doc) {
        response.status(200).send({doc});
      } else {
        response.status(404).send({error: `fail to locate ID ${id}`});
      }
    }, (error) => {
      response.status(400).send({
        error: 'Cannot connect to Mongo DB'
      });
    });
  } 
});

app.patch('/todos/:my_id', authenticate, (request, response) => {
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
    Todo.findOneAndUpdate(
      {_id: id, _creator: request.user._id},
      {$set: body},
      {new: true}).then((doc) => {
      if(!doc) {
        response.status(404).send({error: `ID ${id} cannot be located!`});
      } else {
        response.status(200).send({doc});
      }
    }, (error) => {
      response.statue(400).send({error: `connect update Mongo DB for ID ${id}`});
    });
  }
});

app.post('/users', (request, response) => {
  let body = _.pick(request.body, ['email','password']);
  const user = new User(body);

  user.generateAuthToken()
  .then((token) => {
    if (token) {
      response.header('x-auth', token).send(user);
    } else {
      response.status(400).send({error: 'Unable to save the user'});
    }
  })
  .catch((error) => {
    response.status(400).send(error);
  });
});

app.get('/users', (request, response) => {
  User.find().then((users) => {
    response.send({users});
  }, (error) => {
    response.status(400).send(error);
  });
});

//Private routing
app.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
});

// Post /users/login {email, password}
/*
app.post('/users/login', (request, response) => {
  let body = _.pick(request.body, ['email', 'password']);
  const user = new User(body);

  User.findOne({email: user.email}).then((doc) => {
    if (doc) {
      bcrypt.compare(body.password, doc.password).then((result) => {
        if (result) {
          generateNewToken(doc).then((myDoc) => {
            if (myDoc) {
              const tokens_length = myDoc.tokens.length;
              response.header('x-auth', myDoc.tokens[tokens_length - 1].token)
                .status(200).send(myDoc);
            } else {
              response.status(401).send();
            }
          });
        } else {
          response.status(401).send();
        }
      });
    } else {
      response.status(401).send();
    }
  });
});
*/

app.post('/users/login', loginAuthenticate, (request, response)=>{
  debugger;
  if (response.locals.token && response.locals.user) {
    response.header( 'x-auth', response.locals.token).send(response.locals.user); 
  }
});

app.delete('/users/me/token', authenticate, (request, response) => {
  request.user.removeToken(request.token).then((doc) => {
    response.status(200).send(doc);
  }, (error) => {
    response.status(400).send(error);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
