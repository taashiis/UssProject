const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IncogSafe');
const Schema = mongoose.Schema;


const addnoteSchema = new Schema({
    email:String,title:String,hashednote:String
});

const addnote = mongoose.model('addnote',addnoteSchema);
module.exports = addnote;
mongoose.set('bufferCommands', false);