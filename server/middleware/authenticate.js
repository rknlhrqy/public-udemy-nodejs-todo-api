const bcrypt = require('bcryptjs');
const {User} = require('../models/user');
const jwt = require('jsonwebtoken');

/*
const authenticate = (request, response, next) => {
  const token = request.header('x-auth');

  User.findByToken(token).then((user) => {
    if (user) {
      request.user = user;
      request.token = token;
      next();
    } else {
      response.status(401).send({error: 'Unable to locate the user!'});
    }
  }).catch((error) => {
    response.status(401).send(error);
  });
};
*/
const authenticate = async (request, response, next) => {
  const token = request.header('x-auth');

  try {
    const user = await User.findByToken(token);
    if (user) {
      request.user = user;
      request.token = token;
      next();
    } else {
      response.status(401).send({error: 'Unable to locate the user!'});
    }
  } catch(error) {
    response.status(401).send(error);
  };
};

const generateNewToken = (user) => {
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);
  //user.tokens.push({access, token});

  return User.findOneAndUpdate(
    {email: user.email},
    {$set: {tokens: user.tokens}},
    /* the following options DO NOT work! */
    //{returnOriginal: false}
    //{returnNewDocument: true}
    {new: true}
  );
};
/*
const loginAuthenticate = (request, response, next)=>{
  User.findOne({ email: request.body.email }).then((user)=>{
    if(!user){
      return new Promise.reject();
    }
    bcrypt.compare(request.body.password, user.password, (err, res)=>{
      if(!err && res === true){
        //Generate new token
        generateNewToken(user).then((myUser) => {
          if (myUser) {
            response.locals.user = myUser;
            if (myUser.tokens) {
              const tokens_length = myUser.tokens.length;
              response.locals.token = myUser.tokens[tokens_length-1].token;
            }
            next();
          }
        }, (error) => {
          console.log('no data');
        });
      }
    });
  }).catch((e)=>{
    response.status(401).send();
  });
};
*/

const loginAuthenticate = async (request, response, next)=>{
  try {
    const user = await User.findOne({ email: request.body.email });
    if(!user){
      return new Promise.reject();
    }
 
    bcrypt.compare(request.body.password, user.password, async (err, res) => {
      if(!err && res === true){
        //Generate new token
        const myUser = await generateNewToken(user);
        if (myUser) {
          response.locals.user = myUser;
          if (myUser.tokens) {
            const tokens_length = myUser.tokens.length;
            response.locals.token = myUser.tokens[tokens_length-1].token;
          }
          next();
        }
      }
    });
  } catch(e) {
    response.status(401).send();
  }

};

module.exports= {
  authenticate,
  generateNewToken,
  loginAuthenticate
};