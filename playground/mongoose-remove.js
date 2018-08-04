
const {ObjectID} = require('mongodb');

const {mongoose} = require('mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

/*
 * Remove all documents
 */
Todo.remove({}).then((result) => {
  console.log(result);
});

/*
 * Find one and remove
 */
 Todo.findOneAndRemove({text: "Cook dinner"}).then((result)=> {
   console.log(JSON.stringify(result, undefined, 2));
 });

 /*
  * Find by ID and remove them
  */
 Todo.findByIdAndRemove('5b4a705a55b41bf9f3986c98').then((result) => {
   console.log(JSON.stringify(result, undefined, 2));
 });