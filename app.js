//app running on http://localhost:3000/
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mail = require('./mail');
const csrf = require('csurf');
const session = require('express-session') ;
var nodemailer = require('nodemailer');
const rateLimit = require("express-rate-limit");
const app = express();

var user = ""
const saltRounds = 10;
// //Password handler
const bcrypt = require('bcrypt');
var Cryptr = require('cryptr');
Cryptr = new Cryptr('myemabjnhbugvyf'); // keyyy
// var enc = Cryptr.encrypt('anas20023@gmail.com');
// var dec = Cryptr.decrypt(enc);
// Mongodb user model
const signupuser = require("./models/signupuser");
const addpass = require("./models/addpass");
const addnote = require("./models/addnote");
const adddetail = require("./models/adddetail");
const addovd = require("./models/addovd");
// Using the CSRF token
const csrfProtection = csrf();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// create a rate-limiter middleware with a maximum of 100 requests per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});

// apply the rate-limiter middleware to all requests
app.use(limiter);

app.use(session({
  secret : 'It needs to be in the env file.',
  resave: false, 
  saveUninitialized: false, 
  cookie: {maxAge:1000*60*15}, // cookie only valid for 15 minutes
  email:'',
  secure:true,
  httpOnly:true
}))
app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
})

app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    res.send('Session has expired. Please refresh the page.');
  } else {
    next(err);
  }
});
// This tells the browser not to cache the page at all, and to always request it from the server.
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});


// All get requests for webpages
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  var alert = req.query.alert;
  res.render("login",{alert:alert});
});

app.get("/forgot", function (req, res) {
  res.render("forgot");
});

app.get("/createnewpass", function (req, res) {
  res.render("createnewpass");
});

d = []//dict of saved passwords of a user
n = []//dict of saved noted of a user
det = []// dict of saved details of a user
ovd = []// dict of saved ovd of a user

// 
var check_f = 0

app.get("/homepage",function(req,res){
  res.render("dashboard", {d:d,n:n,det:det})
});

app.get("/dashboard", function (req, res) {
  d = []//dict of saved passwords of a user
  n = []//dict of saved noted of a user
  det = []// dict of saved details of a user
  ovd = []// dict of saved ovd of a user
  console.log("this is dashboard")
  var email = req.session.email;
  addpass.find({email})
  .then(data=>{
    if(data){
      for (let i = 0; i < data.length; i++) {
        if (data[i].email == email) {
          var pass = Cryptr.decrypt(data[i].hashedpasswd)
          dict = {}
          dict = data[i]
          dict.hashedpasswd=pass
          d.push(dict)
        }
      }
    }
  })
  res.redirect("/addnotes");
});



app.get("/addnotes",function(req,res){
  console.log("this is addnotes :get")
  var email = req.session.email;
  addnote.find({email})
  .then(data=>{
    if(data){
      for (let i = 0; i < data.length; i++) {
        if (data[i].email == email) {
          var note = Cryptr.decrypt(data[i].hashednote)
          dict = {}
          dict = data[i]
          dict.hashednote=note
          n.push(dict)
        }
      }
    }
  })
  console.log(n)
  res.redirect("/adddetail");
});

app.get("/adddetail",function(req,res){
  console.log("this is adddetails :get")
  var email = req.session.email;
  adddetail.find({email})
  .then(data=>{
    if(data){
      for (let i = 0; i < data.length; i++) {
        if (data[i].email == email) {
          var hashaddress = Cryptr.decrypt(data[i].hashaddress)
          var hashmobile = Cryptr.decrypt(data[i].hashmobile)
          dict = {}
          dict = data[i]
          dict.hashaddress=hashaddress
          dict.hashmobile=hashmobile
          det.push(dict)
        }
      }
    }
  })
  console.log(det)
  res.redirect("/addovd");
});

app.get("/addovd",function(req,res){
  console.log("this is addovd :get")
  var email = req.session.email;
  addovd.find({email})
  .then(data=>{
    if(data){
      for (let i = 0; i < data.length; i++) {
        if (data[i].email == email) {
          var docno = Cryptr.decrypt(data[i].hasheddocno)
          dict = {}
          dict = data[i]
          dict.hasheddocno=docno
          ovd.push(dict)
        }
      }
    }
  })
  console.log(ovd)
  res.redirect("/homepage");
});

app.get("/verify", function (req, res) {
  res.render("verify");
});
// app.get
// Jab yeh
app.get('/logout', function (req, res) {

  req.session.destroy(function (err) {
      if (err){
          console.log(err)
      }
      else{
        d = []//dict of saved passwords of a user
        n = []//dict of saved noted of a user
        det = []// dict of saved details of a user
        ovd = []// dict of saved ovd of a user
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.redirect('/')

      }
  })
})

// // All post requests from forms

app.post("/deletepass",function(req,res){
  console.log("deleting a password!")
  var passdata = req.body;
  var email = req.session.email;
  console.log(email);
  console.log("in pst delete password");
  let{website} = passdata;
  website = passdata.website;
  addpass.deleteOne({ email:email, website:website}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Password deleted successfully!');
      res.redirect('/dashboard');
    }
  });
});

app.post("/deletenote",function(req,res){
  console.log("deleting a note!")
  var notedata = req.body;
  var email = req.session.email;
  console.log(email);
  console.log("in pst delete note");
  let{title} = notedata;
  title = notedata.title;
  addnote.deleteOne({ email:email, title:title}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('note deleted successfully!');
      res.redirect('/dashboard');
    }
  });
});

app.post("/deletedetail",function(req,res){
  console.log("deleting a detail!")
  var detaildata = req.body;
  var email = req.session.email;
  console.log(email);
  console.log("in pst delete detail");
  let{name} = detaildata;
  name = detaildata.name;
  adddetail.deleteOne({ email:email, name:name}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('detail deleted successfully!');
      res.redirect('/dashboard');
    }
  });
});

app.post("/deleteovd",function(req,res){
  console.log("deleting a ovd!")
  var odvdata = req.body;
  var email = req.session.email;
  console.log(email);
  console.log("in pst delete detail");
  let{nameofdoc} = odvdata;
  nameofdoc = odvdata.nameofdoc;
  addovd.deleteOne({ email:email, nameofdoc:nameofdoc}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('ovd deleted successfully!');
      res.redirect('/dashboard');
    }
  });
});

app.post("/createnewpass",function(req,res){
  var newpassdata = req.body;
  emailn = req.session.email
  let{pin,cpin}=newpassdata;
  pin = newpassdata.pin;
  cpin = newpassdata.cpin;
  console.log(emailn)
  console.log("reached create pass");
  console.log(newpassdata);
  if(pin==""||cpin==""){
    res.redirect('/createnewpass');
  }
  else if(pin!=cpin){
    res.send("Both Passwords Do not Match!")
}
  else{
    bcrypt.hash(pin,saltRounds).then(hashedpasswd=>{
      console.log("Yuo are on right path")
      signupuser.updateOne({ email: emailn }, { pin: hashedpasswd }, function(err, result) {
        console.log(result)
        if (err) {
          console.log('Error updating document:', err);
        } else {
          console.log('Document updated successfully:', result);
          check_f = 0
          d = []//dict of saved passwords of a user
          n = []//dict of saved noted of a user
          det = []// dict of saved details of a user
          ovd = []// dict of saved ovd of a user
          res.redirect('/login')
        }
      });
    }).catch(err=>{
      res.json({
      status:"FAILED",
      message:"Error occured while hashing passwd!"
    })
  })

  }
});

app.post("/addovd",function(req,res){
  console.log("Adding a OVD!")
  var ovddata = req.body;
  var email = req.session.email;
  var nhiphatega = 0 
  // console.log(email);
  console.log("in post : addovd");
  let{nameofdoc,docno} = ovddata;
  nameofdoc = ovddata.nameofdoc;
  docno = ovddata.docno;
  var duplicatedocnamecheck = 1;
  if(nameofdoc==""||docno==""){
    res.json({
      status:"FAILED",
      message:"Empty input fields!"
    })
  }
  else if(duplicatedocnamecheck==1){
    console.log("in name check of details");
    addovd.find({email}).then(data=>{
      for (let i = 0; i < data.length; i++) {
        if (data[i].nameofdoc == nameofdoc) {
          duplicatedocnamecheck=0;
          break;
        }
      }
      if(duplicatedocnamecheck==0){
        console.log("This name of details already exists!");
        nhiphatega = 1
        res.redirect('/dashboard')
      }
      else{
        var hasheddocno = Cryptr.encrypt(docno);
        const newaddovd = new addovd({email,nameofdoc,hasheddocno});
        newaddovd.save().then(result=>{
          console.log("Added OVD succesfully");
          console.log(newaddovd);
          res.redirect('/dashboard');
        })
        .catch(err=>{
          res.json({
            status:"Failed",
            message:"Error occured while Adding OVD up!"
          }) 
        })
      }
    })
  }
  // if(duplicatedocnamecheck==1 && nameofdoc!="" && docno!="" && nhiphatega==0){
  //   var hasheddocno = Cryptr.encrypt(docno);
  //   const newaddovd = new addovd({email,nameofdoc,hasheddocno});
  //   newaddovd.save().then(result=>{
  //     console.log("Added OVD succesfully");
  //     console.log(newaddovd);
  //     res.redirect('/dashboard');
  //   })
  //   .catch(err=>{
  //     res.json({
  //       status:"Failed",
  //       message:"Error occured while Adding OVD up!"
  //     }) 
  //   })
  // }
});

app.post("/adddetails",function(req,res){
  console.log("Adding a Detail!")
  var detailsdata = req.body;
  var email = req.session.email;
  // console.log(email);
  console.log("in post : adddetails");
  let{name,address,mobile} = detailsdata;
  name = detailsdata.name;
  address = detailsdata.address;
  mobile = detailsdata.mobile;
  var duplicatenamecheck = 1;
  var nhiphatega = 0
  if(name==""||mobile==""){
    res.json({
      status:"FAILED",
      message:"Empty input fields!"
    })
  }
  else if(duplicatenamecheck==1){
    console.log("in name check");
    adddetail.find({email}).then(data=>{
      for (let i = 0; i < data.length; i++) {
        if (data[i].name == name) {
          duplicatenamecheck=0;
          break;
        }
      }
      if(duplicatenamecheck==0){
        console.log("This name of details already exists!");
        nhiphatega=1
        res.redirect('/dashboard')
      }
      else{
        var hashaddress = Cryptr.encrypt(address);
        var hashmobile = Cryptr.encrypt(mobile);
        const newadddetail = new adddetail({email,name,hashaddress,hashmobile});
        newadddetail.save().then(result=>{
          console.log("Added details succesfully");
          console.log(newadddetail);
          res.redirect('/dashboard');
        })
        .catch(err=>{
          res.json({
            status:"Failed",
            message:"Error occured while Adding Pass up!"
          }) 
        })
      }
    })
  }
  // if(duplicatenamecheck==1 && name!="" && mobile!="" && nhiphatega==0){
  //   var hashaddress = Cryptr.encrypt(address);
  //   var hashmobile = Cryptr.encrypt(mobile);
  //   const newadddetail = new adddetail({email,name,hashaddress,hashmobile});
  //   newadddetail.save().then(result=>{
  //     console.log("Added details succesfully");
  //     console.log(newadddetail);
  //     res.redirect('/dashboard');
  //   })
  //   .catch(err=>{
  //     res.json({
  //       status:"Failed",
  //       message:"Error occured while Adding Pass up!"
  //     }) 
  //   })
  // }
});

app.post("/addnotes",function(req,res){
  console.log("Adding a note!")
  var notedata = req.body;
  var email = req.session.email;
  var nhiphatega = 0
  // console.log(email);
  console.log("in post : addnotes");
  let{title,notes} = notedata;
  title = notedata.title;
  notes = notedata.notes;
  var duplicatetitlecheck = 1;
  if(title==""||notes==""){
    res.json({
      status:"FAILED",
      message:"Empty input fields!"
    })
  }
  else if(duplicatetitlecheck==1){
    console.log("in title check");
    addnote.find({email}).then(data=>{
      for (let i = 0; i < data.length; i++) {
        if (data[i].title == title) {
          duplicatetitlecheck=0;
          break;
        }
      }
      if(duplicatetitlecheck==0){
        console.log("This Title name of note already exists!");
        nhiphatega = 1
        res.redirect('/dashboard')
      }
      else{
        var hashednote = Cryptr.encrypt(notes);
        const newaddnote = new addnote({email,title,hashednote});
        newaddnote.save().then(result=>{
          console.log("Added note succesfully");
          console.log(newaddnote);
          res.redirect('/dashboard');
        })
        .catch(err=>{
          res.json({
            status:"Failed",
            message:"Error occured while Adding Pass up!"
          }) 
        })
      }
    })
  }
  // if(duplicatetitlecheck==1 && title!="" && notes!="" && nhiphatega==0){
    // var hashednote = Cryptr.encrypt(notes);
    // const newaddnote = new addnote({email,title,hashednote});
    // newaddnote.save().then(result=>{
    //   console.log("Added note succesfully");
    //   console.log(newaddnote);
    //   res.redirect('/dashboard');
    // })
    // .catch(err=>{
    //   res.json({
    //     status:"Failed",
    //     message:"Error occured while Adding Pass up!"
    //   }) 
    // })
  // }
});

app.post("/addpassword",function(req,res){
  console.log("Adding a password!")
  var passdata = req.body;
  var email = req.session.email;
  console.log(email);
  var nhiphatega = 0
  console.log("in pst addpassword");
  let{website,link,username,password} = passdata;
  website = passdata.website;
  link = passdata.link;
  username = passdata.username;
  password = passdata.password;
  var duplicatewebsitecheck = 1
  if(website==""||password==""){
    res.send("Empty Input Fields")
  }
  else if(duplicatewebsitecheck==1){
    console.log("in website check");
    addpass.find({email}).then(data=>{
      for (let i = 0; i < data.length; i++) {
        if (data[i].website == website) {
          duplicatewebsitecheck=0;
          break;
        }
      }
      if(duplicatewebsitecheck==0){
        console.log("This website name already exists!");
        nhiphatega=1
        console.log(nhiphatega)
        res.redirect('/dashboard')
      }
      else{
        var hashedpasswd = Cryptr.encrypt(password);
        // console.log(hashedpasswd)
        const newaddpass = new addpass({email,website,link,username,hashedpasswd});
        newaddpass.save().then(result=>{
        console.log("Add Pass Success");
        // console.log(newaddpass);
        res.redirect('/dashboard')
        })
        .catch(err=>{
          res.json({
          status:"Failed",
          message:"Error occured while Adding Pass up!"
          })                  
        })
      }
    })
  }
});

app.post("/signup",function(req,res){

  var signupdata = req.body;
  let{name,email,pin,pinconfirm}=signupdata;
  name = signupdata.name;
  email = signupdata.email;
  pin = signupdata.pin;
  pinconfirm = signupdata.pinconfirm;
  console.log("reached here");
  console.log(signupdata);
  var signup_check = 0;
  if(name==""||email==""||pin==""||pinconfirm==""){
    res.redirect('/signup');
  }
  else if(!/^[a-zA-Z ]*$/.test(name)){
    res.send("Invalid Name Entered!")
  }
  else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
    res.send("Invalid Email Entered!")
  }
  else if(pin!=pinconfirm){
      res.send("Both Passwords Do not Match!")
  }
  else{
    // Check if the new user is already present in the same Database
    console.log(email)
    signupuser.find({email}).then(result=>{
      console.log(email)
      console.log("gfvhbjnk")
      if(result.length){
        // res.send("Email is Already Present! Try Logging into the System");
        res.json({
          status:"FAILED",
          message:"User already exist with that email"
        })
      }
      else{

        bcrypt.hash(pin,saltRounds).then(hashedpasswd=>{
        const newsignupuser = new signupuser({name,email,pin:hashedpasswd});
        newsignupuser.save().then(result=>{
          console.log("Signup Success");
          console.log(newsignupuser);
          res.redirect('/login');
          })
          .catch(err=>{
            res.json({
            status:"Failed",
            message:"Error occured while signing up!"
            })                  
          })
          }).catch(err=>{
            res.json({
            status:"FAILED",
            message:"Error occured while hashing passwd!"
            })
          })
      }
    })
  }
});

var otpSys = ""

app.post("/login", function (req, res) {
  var loginData = req.body;
  let{emailu,pin}=loginData;
  // console.log(loginData);
  emailu = loginData.email;
  pin = loginData.pin;
  check = 1;
  var alert = 1
  if(emailu=="" || pin==""){
    res.redirect('/login')
    check = 0;
  }
  else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailu)){
    // console.log("3");
    // res.send("Invalid Email Entered!")
    res.redirect('/login?alert='+alert)

  }
  console.log(loginData.email);
  if(check==1){
    signupuser.find({emailu})
    .then(data=>{
      let hpin = null;
      if(data){
        for (let i = 0; i < data.length; i++) {
          if (data[i].email === emailu) {
            hpin = data[i].pin;
            break;
          }
        }
      
      bcrypt.compare(pin, hpin).then(result=>{
      if(result){
        console.log("Signin succesful")
        check = 0;
        // req.session.email = email;
        // req.session.type = type;
        // user = newsignupuser;
        otpSys = Math.floor(Math.random()*900000 + 100000)
        mail.sendMail(emailu, otpSys)
        console.log("OTP Sent")
        req.session.email = emailu;
        console.log("email:")
        console.log(req.session.email)
        res.redirect('/verify')

      }
      else{
        res.json({
        status:"FAILED",
        message:"Invalid Password entered!"
        })
      }
      }).catch(err=>{
          res.json({
          status:"FAILED",
          message:"An error Occured while checking for existing user!"
          })
        })
      }
    })
  }
});
var check_verify = 1;
app.post('/verify', function (req, res) {
  console.log("in verify")
  var otpData = req.body;
  let {otpu} = otpData;
  otpu = otpData.otp;
  if (otpSys == otpu){
      console.log('otp verified')
      otpSys = ""
      // user.save();
      req.session.isLoggedIn = true ;
      check_verify = 0
      if(check_f==1){
        res.redirect('/createnewpass')
      }
      else{
        res.redirect('/dashboard')
      }
  }
  else{
    console.log("Wrong OTP Entered or Probably the OTP has expired")
    // req.session.isLoggedIn = true ;
    res.redirect('/login')
  }

});

app.post("/forgot", function (req, res) {
  var email = req.body.email;
  console.log(email)
  // res.send(email);
  var zabardasti = 0
  if(zabardasti==0){
    signupuser.find({email})
    .then(data=>{
      if(data){
        for (let i = 0; i < data.length; i++) {
          if (data[i].email == email) {
            zabardasti = 1
            console.log("email is present in db")
            otpSys = Math.floor(Math.random()*900000 + 100000)
            mail.sendMail(email, otpSys)
            console.log("OTP Sent")
            req.session.email = email;
            console.log("email:")
            console.log(req.session.email)
            check_f = 1
            res.redirect('/verify')
            break;
          }
        }
        if(zabardasti==0){
          console.log("Email is not present!")
          res.redirect('/signup')
        }
      }
    })
  }  
});



// app.post("/contact", function (req, res) {
//   var contactData = req.body;
//   res.send(contactData);
// });

//app running on http://localhost:3000/
app.listen(3000, function () {
  console.log("Server running on port 3000");
});
