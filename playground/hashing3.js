const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = 'abc123!';

const salt = bcrypt.genSaltSync(10);
console.log('salt:', salt);
const hash = bcrypt.hashSync(password, salt);
console.log('hash:', hash);
const result = bcrypt.compareSync(password, hash);
console.log(result);

// If the password is hacked...
const result2 = bcrypt.compareSync(password + '2', hash);
console.log(result2);


/*
let hashedPassword;
bcrypt.genSaltSync(10, (error, salt) => {
  bcrypt.hashSync(password, salt, (error, hash) => {
    hashedPassword = hash;
    console.log(hash);
  });
});

bcrypt.compare(password, hashedPassword, (error, response) => { 
  console.log(response);
});
*/