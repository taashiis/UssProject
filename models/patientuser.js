
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/MA');
const Schema = mongoose.Schema;


const patientuserSchema = new Schema({
    firstname:String,lastname:String,phone:String,gender:String,
    address1:String,address2:String,zipcode:Number,state:String,
    city:String,country:String,dob:Date,email:String,passwd:String
});

// const MyModel = mongoose.model('Test', patientuserSchema);

const patientuser = mongoose.model('patientuser',patientuserSchema);

module.exports = patientuser;
mongoose.set('bufferCommands', false);