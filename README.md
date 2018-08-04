# udemy-nodejs-node-todo-api
This project provides a web server which supports many private routings. It receives the HTTP request from the customer and then access the MongoDB provided in mlab.com.

This web server is implemented using node.js and Express framework.
It is tested using Mocha.
It is using the Mongo DB provided in www.mlab.com.

This web server is mounted in the following web address: https://udemy-nodejs-node-todo-api.herokuapp.com/

To use it, you need to do the followings:<br>
1, Find the value of the environment variable "process.env.NODE_ENV" in your system. For example, if it is "production",<br>
2, in example_config.json, add a block like below<br>
 "production": {<br>
    "PORT": 3000,<br>
    "MONGODB_URI": "mongodb://localhost:2000/MyAppDB",<br>
    "JWT_SECRET": "dsdoafhascjawoefh9203h(#HF)Q#HF)#(U0jfhweiohfo"<br>
  }<br>
3, And define PORT, MONGODB_URI and JWT_SECRET.<br>
  PORT: the port of this web server.<br>
  MONGODB_URI: the "mongodb://...." link to the MongoDB server.<br>
  JWT_SECRET: Json Web Token. A library to manage/calculate/verify tokens. Go to https://www.npmjs.com/package/jsonwebtoken and https://jwt.io/ for more info.<br>
4, Just rename example_config.json to be config.json.<br>
