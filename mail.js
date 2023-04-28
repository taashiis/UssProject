const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'incogsafe21@gmail.com',
    pass: 'ucluamksbhyoqwok'
    // '1kqg3adone@'
    }
});


exports.sendMail = function (reciever, message) {

    var mailOptions = {
        from: 'incogsafe21@gmail.com',
        to: "" + reciever,
        subject: 'OTP for your account from IncogSafe',
        text: "This OTP is Only Valid for 2 minutes: " + message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent'+info.response);
            setTimeout(() => {console.log('OTP expired: ' + message);}, 120000); // 2 minutes
        }
    });
}