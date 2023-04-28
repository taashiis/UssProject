const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IncogSafe');
const Schema = mongoose.Schema;


const addpassSchema = new Schema({
    email:String,website:String,link:String,username:String,hashedpasswd:String
});

const addpass = mongoose.model('addpass',addpassSchema);
module.exports = addpass;
mongoose.set('bufferCommands', false);