const validator = require('validator');
const {mongoose} = require('../db/mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate : {
      //validator: validator.isEmail,
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true 
    },
    token: {
      type: String,
      required: true 
    }
  }]
});

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);
  // Not returning a promise. But returning a value token.
  return user.save().then(() => {
    return token;
  }, (error) => {
    return null;
  });
};

UserSchema.methods.removeToken = function (token) {
  let user = this;
  //return user.update({$pull: {tokens: {token: token}}});
  return user.update({$pull: {tokens: {token}}});
}


UserSchema.methods.toJSON = function () {
  let user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
  } catch (error) {
    /*
    return new Promise((resolve, reject) = > {
      reject(error);
    });
    */
   return Promise.reject(error);
  }
};

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this;
  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    } else {
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, function(error, result) {
          if (!error && result) {
            resolve(user);
          } else {
            reject();
          }
        });
      });
    }
  });
};


UserSchema.pre('save', function(next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (error, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};