const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IncogSafe');
const Schema = mongoose.Schema;


const addovdSchema = new Schema({
    email:String,nameofdoc:String,hasheddocno:String
});

const addovd = mongoose.model('addovd',addovdSchema);
module.exports = addovd;
mongoose.set('bufferCommands', false);