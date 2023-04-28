const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IncogSafe');
const Schema = mongoose.Schema;


const adddetailSchema = new Schema({
    email:String,name:String,hashaddress:String,hashmobile:String
});

const adddetail = mongoose.model('adddetail',adddetailSchema);
module.exports = adddetail;
mongoose.set('bufferCommands', false);