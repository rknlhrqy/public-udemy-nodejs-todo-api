const {SHA256} = require('crypto-js');

const message = 'I am User No. 3';
const hash = SHA256(message).toString();

console.log('message:', message);
console.log('Hash:', hash);

const data = {
  id: 4
};
// Tokens is sent to the user.
const tokens = {
  data,
  hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
};

//Assault from Hacker!
tokens.data.id = 5;
tokens.hash = SHA256(JSON.stringify(data)).toString();

// Server verifies the hash of the received data from the user.
const resultHash = SHA256(JSON.stringify(tokens.data) + 'somesecret').toString();

if (resultHash === tokens.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was manipulated!');
}
