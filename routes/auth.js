const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/users"),
    middleware = require("../middleware"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto");

// root routes
router.get("/", function (req, res) {
    console.log("LANDING - HOME ROUTE GET");
    res.render('landing', {
        pagetitle: "Sleep Safe - Landing"
    });
});

// login form
router.get("/login", function (req, res) {
    console.log("LOGIN GET SHOW");
    res.render("auth/login", {
        pagetitle: "Sleep Safe -Login",
        page: 'login'
    });
});

router.post('/login', usernameToLowerCase, function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error", "Those credentials don't seem to work!");
            return res.redirect("/login");
        }
        //   return res.redirect('/login'); }
        if (user && user.disabled) {
            req.flash("error", "That profile has been disabled!");
            return res.redirect('/sites');
        }

        req.logIn(user, function (err) {
            if (err) {
                req.flash("error", err);
                return res.redirect("/login");
            }
            req.flash("success", "Welcome " + user.showName);
            return res.redirect('/sites/'); // + user.username);
        });
    })(req, res, next);
});


//register form request
router.get("/register", function (req, res) {
    console.log("REGISTER GET SHOW");
    res.render("auth/register", {
        pagetitle: "Sleep Safe -Register",
        page: 'register'
    });
});

// register post
router.post("/register", usernameToLowerCase, function (req, res) {
    console.log("REGISTER POST");
    var role = 0;
    User.count({}, function (err, count) {
        if (err) {
            console.log(err.message);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        if (count === 0) {
            role = 2;
        } // make first ever user an admin otherwise nobody could be admin without command line mongo
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            role: role,
            showName: req.body.showname
        });

        User.register(newUser, req.body.password, function (err, user) {
            if (err) {
                console.log(err.message);
                req.flash("error", err.message);
                return res.redirect("/register");
            } else {
                // console.log(user);
                var addtext = "";
                if (role === 2) {
                    addtext = ", as you are the first user you've been made an Admin"
                }
                req.flash("success", "Welcome " + req.body.showname + addtext + ". Please Logon to continue");
                res.redirect("/login");
            }
        });
    });
});

// logout
router.get("/logout", middleware.isLoggedIn, function (req, res) {
    console.log("LOGOUT GET");
    req.logout();
    // req.session.distroy();
    req.flash("success", "You logged out!");
    res.redirect("/sites");
});

// forgot password
router.get('/forgot', function (req, res) {
    res.render('auth/forgot', {
        pagetitle: "Sleep Safe - Reset Password",
        page: 'reset password'
    });
});

//add new password reset and mail address
router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({
                email: req.body.email
            }, function (err, user) {
                if (err) {
                    console.log(err);
                }

                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'sleepsafespace@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'sleepsafespace@gmail.com',
                subject: 'Password Reset for Sleep Safe Space',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (err) {
            console.log(err);
        }

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('auth/resetpassword', {
            token: req.params.token,
            pagetitle: "Reset Password",
            page: 'reset password'
        });
    });
});

router.post('/reset', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({
                resetPasswordToken: req.body.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function (err, user) {
                if (err) {
                    console.log(err);
                }
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.passwordcheck) {
                    user.setPassword(req.body.password, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            }
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'sleepsafespace@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'sleepsafespace@gmail.com',
                subject: 'Your Sleep Safe Space password has been changed',
                text: 'Hello ' + user.showName + ',\n\n' +
                    'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/sites');
    });
});


module.exports = router;

function usernameToLowerCase(req, res, next) {
    req.body.username = req.body.username.toLowerCase();
    req.body.showname = req.body.username.charAt(0).toUpperCase() + req.body.username.slice(1);
    next();
}