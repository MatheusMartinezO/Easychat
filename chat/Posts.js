var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  
    usuarioss: Array,
    socketIdss: Array,

},{collection:'posts'})

var Posts = mongoose.model('Posts',PostSchema);

module.exports = Posts;