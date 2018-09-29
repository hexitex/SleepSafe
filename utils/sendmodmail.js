const User = require("../models/users"),
    nodemailer = require("nodemailer");

module.exports = function (req,res,subject, message, url) {
    const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'sleepsafespace@gmail.com',
            pass: process.env.GMAILPW
        }
    });
    User.find({role: {$gte: 1}},{disabled: false}).exec(function (err, mods) {
        if (err) {
            console.log(err);
            return;
        }

        mods.forEach(function (mod) {

            const mailOptions = {
                to: mod.email,
                from: 'sleepsafespace@gmail.com',
                subject: subject,
                text: message + '\n' + 'https://' + req.headers.host + url + '\n\n' + 'Please check for explicit or spam content\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                done(err, 'done');
            });
        });
    })
};
