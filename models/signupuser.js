
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IncogSafe');
const Schema = mongoose.Schema;


const signupuserSchema = new Schema({
    name:String,email:String,pin:String
});

const signupuser = mongoose.model('signupuser',signupuserSchema);
module.exports = signupuser;
mongoose.set('bufferCommands', false);