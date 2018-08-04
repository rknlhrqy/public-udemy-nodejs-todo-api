
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/TodoApp2', {useNewUrlParser: true});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
module.exports = {
  mongoose
};
