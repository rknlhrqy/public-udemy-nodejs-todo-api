const {ObjectID} = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todosInit, users, populateTodos, populateUsers} = require('./seed/seed');

let docNum = todosInit.length/2;
beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo document', (done) => {
    const _id = new ObjectID();
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text, _id})
      .expect(200)
      .expect((response) => {
        expect(response.body.text).toBe(text);
      })
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          Todo.find({_creator: users[0]._id}).then((todos) => {
            expect(todos.length).toBe(docNum + 1);
            expect(todos[docNum].text).toBe(text);
            done();
          }).catch((error) => done(error));
        }
      });
  });

  it('should not create a new todo document with invalid body data',
  function (done) {
    this.timeout(5000);
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          Todo.find({_creator: users[0]._id}).then((todos) => {
            expect(todos.length).toBe(docNum);
            done();
          }).catch((error) => done(error));
        }
      });
  });
});

describe('GET /todos', () => {
  it ('should return all the todos documents', (done) => {
    let localTodos;
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(200)
      .expect((response) => {
        expect(response.body.todos).toHaveLength(docNum);
        localTodos = response.body.todos;
      })
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          Todo.find({_creator: users[0]._id}).then((todos) => {
            expect(JSON.parse(JSON.stringify(todos)))
              .toMatchObject(JSON.parse(JSON.stringify(localTodos)));
            done();
          }).catch((error) => done(error));
        }
      });
  });
});

describe('GET /todos/:id', () => {
  it ('should disqualify the invalid id of a document', (done) => {
    const id = todosInit[1]._id.toString() + '1';
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(404)
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          expect(response.body.error).toBe(`ID ${id} not valid!`);
          done();
        }
      });
  });

  it ('should not find a document for non-existing id', (done) => {
    const id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(404)
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          expect(response.body.error).toEqual(`fail to locate ID ${id}!`);
          done();
        }
      });
  });

  it ('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todosInit[1]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send()
      .expect(404)
      .end(done);
  });

  it ('should find a document', (done) => {
    let doc;
    const id = todosInit[2]._id.toHexString();
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(200)
      .expect((response) => {
        doc = response.body.doc;
      })
      .end((error, response) => {
        if (error) {
          done(error);
        } else { 
          //Todo.findById(id).then((todo) => {
          //  expect(JSON.parse(JSON.stringify(todo)))
          //    .toMatchObject(JSON.parse(JSON.stringify(doc)));
          //  done();
          //}).catch((error) => done(error));

          Todo.findById(id).then((todo) => {
            expect(JSON.parse(JSON.stringify(todo)))
              .toMatchObject(JSON.parse(JSON.stringify(doc)));
            done();
          }, (error) => done(error));
 
        }
      });
  });
});

describe('DELETE /todos/:id', () => {

  it('should return 404 if id is not valid', (done) => {
    const id = todosInit[3]._id.toString() + '1';
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(404)
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          expect(response.body.error).toBe(`ID ${id} not valid!`);
          done();
        }
      });
  });

  it ('should return 404 if id is not found', (done) => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(404)
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          expect(response.body.error).toBe(`fail to locate ID ${id}`);
          done();
        }
      });
  });


  it('should delete a document', (done) => {
    const id = todosInit[4]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(200)
      .expect((response) => {
        expect(response.body.doc._id).toBe(id);
      })
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          Todo.where({}).countDocuments((error, result) => {
            if (error) {
              console.log('Unable to count documents in Mongo DB');
              done(error);
            } else {
              expect(result - 5).toBe(docNum - 1);
              done();
            }
          }).catch((error) => done(error));
        }
    });
  });

  it ('should not remove a document which is not owned by the user', (done) => {
    const id = todosInit[3]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send()
      .expect(404)
      .end((error, response) =>{
        if (error) {
          done(error);
        } else {
          Todo.findById(id).then((todo) => {
            expect(todo).not.toBeNull();
            expect(todo).not.toBeUndefined();
          });
          done();
        }
      });
  });

});

describe('PATCH /todos/:id', () => {
  it('should update the todo document', (done) => {
    const id = todosInit[7]._id.toHexString();
    const text = 'Go to gym';
    const completed = true;
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({completed, text})
      .expect(200)
      .end((error, response) => {
        if (response) {
          expect(response.body.doc._id).toBe(id);
          expect(response.body.doc.completed).toBe(true);
          expect(response.body.doc.text).toBe(text);
          expect(response.body.doc.completedAt).not.toBeNull();
        } else {
          console.log('no document is retured.');
        }
        done();
      });
  });

  it ('should clear completeAt when todo is not completed', (done) => {
    const id = todosInit[8]._id.toHexString();
    const completed = false;
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({completed})
      .expect(200)
      .end((error, response) => {
        if (response) {
          expect(response.body.doc._id).toBe(id);
          expect(response.body.doc.completed).toBe(false);
          expect(response.body.doc.completedAt).toBeNull();
        } else {
          console.log('no document is retured.');
        }
        done();
      });
  });

  it ('should not update a todo with another user account', (done) => {
    const id = todosInit[8]._id.toHexString();
    const completed = false;
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({completed})
      .expect(404)
      .end(done);
  });

});

describe('GET /users/me', () => {
  it ('should return user if autenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect((response) => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it ('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .send()
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({
          "message": "jwt must be provided",
          "name": "JsonWebTokenError"
        });
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const newUser = {
      email: 'jack@example.com',
      password: 'abc123!'
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(200)
      .expect((response) => {
        //console.log(response.headers['x-auth']);
        expect(response.headers['x-auth']).not.toBeUndefined();
        expect(response.headers['x-auth']).not.toBeNull();
        expect(response.body._id).not.toBeNull();
        expect(response.body._id).not.toBeUndefined();
        expect(response.body.email).toBe(newUser.email);
      })
      .end((error) => {
        if (error) {
          done(error);
        } else {
          User.findOne({email: newUser.email}).then((user) => {
            expect(user).not.toBeNull();
            expect(user.password).not.toBe(newUser.password);
            done();
          });
        }
      });
  });

  it ('should return validation errors if request invalid', (done) => {
    const newUser = {
      email: 'thomesexample.com',
      password: 'qwer'
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect((response) => {
        expect(response.body.error).toBe('Unable to save the user');
      })
      .end(done);
  });

  it ('should not create user if email in user', (done) => {
    request(app)
      .post('/users')
      .send(users[1])
      .expect(400)
      .expect((response) => {
        expect(response.body.error).toBe('Unable to save the user');
      })
      .end(done);
  });

});

describe('POST /users/login', () => {
  it ('should login user and return auth token', function(done) {
    // loginAuthenticate() needs more time.
    this.timeout(5000);

    const user = {
      email: users[1].email,
      password: users[1].password
    };
    request(app)
      .post('/users/login')
      .send(user)
      .expect(200)
      .expect((response) => {
        //expect(response.header['x-auth']).not.toBeNull();
        //expect(response.header['x-auth']).not.toBeUndefined();

        User.findOne({email: user.email}).then((doc) => {
          expect(response.header['x-auth']).toBe(doc.tokens[1].token);
        }, (error) => {
          console.log(error);
        })
      })
      .end(done);
  });

  it ('should login user and return auth token 2nd test', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).not.toBeNull();
        expect(response.headers['x-auth']).not.toBeUndefined();
      })
      .end((error, response) => {
        if (error) {
          done(error);
        } else {
          User.findById(users[1]._id).then((user) => {
            expect(user.tokens[1]).toHaveProperty(
              'token', response.headers['x-auth']);
            expect(user.tokens[1]).toHaveProperty(
              'access', 'auth');
          });
          done();
        }
      });
  });

  it ('should reject invalid login', (done) => {
    const user = {
      email: 'pppexample.com',
      password: '123'
    };
    request(app)
      .post('/users/login')
      .send(user)
      .expect(401)
      .expect((response) => {
        expect(response.headers['x-auth']).not.toBeNull();
      })
      .end((error, response) => {
        expect(user.tokens).toBeUndefined();
        done();
      });
  });

});

describe('DELETE /users/me/token', () => {
  it ('should remove a qualified token from an account', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .send()
      .expect(200)
      .expect((response) => {
        expect(response.body.nModified).toBe(1);
      })
      .end((error, response) => {
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
        });
        done();
      });
  });
});