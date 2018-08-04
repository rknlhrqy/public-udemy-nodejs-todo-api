const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

//original data
const data = {
  id: 10
};

const token = jwt.sign(data, 'somesecret');
console.log(token);

const decodedData = jwt.verify(token, 'somesecret');
console.log('Decoded:', decodedData);

//If the token is manipulated, 
//const manipulatedData = jwt.verify(token + '1', 'somesecret');
//console.log('Manipulated:', manipulatedData);

//If the somesecret is manipulated,
const manipulatedData2 = jwt.verify(token, 'somesecret1');
console.log('Manipulated:', manipulatedData2);