const express = require("express"),
    router = express.Router({
        mergeParams: true
    }),
    User = require("../models/users"),
    showpages = require("../showware/pagnation"),
    middleware = require("../middleware");

// Show All Users
router.get("/", middleware.isModerator, function (req, res) {
    console.log("PROFILES - INDEX ROUTE GET");
    const perPage = 24;
    const pageQuery = parseInt(req.query.page);
    const pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        User.find({
            $text: {
                $search: req.query.search
            }
        }).skip((perPage * pageNumber) - perPage).limit(perPage).populate('sitesSubmitted').populate('linksSubmitted').populate('commentsMade').exec(function (err, nusers) {
            showResults(err, req, res, nusers, true, pageNumber, perPage);
        });
    } else {
        User.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).populate('sitesSubmitted').populate('linksSubmitted').populate('commentsMade').exec(function (err, nusers) {
            showResults(err, req, res, nusers, false, pageNumber, perPage);
        });
    }
});

// edit user form

router.get("/:user_id/edit", middleware.checkUserEditAllowed, function (req, res, next) {
    console.log("USER - EDIT GET ");
    User.findById(req.params.user_id).then((user) => {
        if (!user) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {
            res.render('profiles/edit', {
                pagetitle: "Sleep Safe - Edit User",
                user: user,
                page: 'edituser'
            });
        }
    }).catch(next);
});

router.put("/:user_id", middleware.checkUserEditAllowed, function (req, res, next) {
    console.log(" PROFILES - PUT UPDATE ");
    User.findByIdAndUpdate(req.params.user_id, req.body.user).then((updateUser) => {
        if (!updateUser) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {

            if (req.body.password.trim().length > 0) {
                updateUser.changePassword(req.body.password, function (err) {

                    if (err) {
                        console.log(err);
                        req.flash("error", "Password not updated! " + err);
                        res.redirect("back");
                    }
                });
            }
            req.flash("success", "User updated!");
            if (updateUser.role > 0) {
                res.redirect("./");
            } else {
                res.redirect('/sites');
            }
        }
    }).catch(next);
});

//disable user
router.put("/:user_id/disable", middleware.isModerator, function (req, res, next) {
    console.log("PROFILES - EDIT DISABLE ");
    User.findByIdAndUpdate(req.params.user_id, {
        'disabled': true
    }).then((disabledUser) => {
        if (!disabledUser) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The user was disabled! ");
            res.redirect("/profiles");
        }
    }).catch(next);
});

//enable user
router.put("/:user_id/enable", middleware.isModerator, function (req, res, next) {
    console.log("PROFILES - EDIT ENABLE ");
    User.findByIdAndUpdate(req.params.user_id, {
        'disabled': false
    }).then((enabledUser) => {
        if (!enabledUser) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The user was enabled! ");
            res.redirect("back");
        }
    }).catch(next);
});

// upgrade user to mod or admin
router.put("/:user_id/upgradeuser", middleware.isAdmin, function (req, res, next) {
    console.log("PROFILES - EDIT upgrade ");
    User.findByIdAndUpdate(req.params.user_id, {
        $inc: {
            role: 1
        }
    }).then((user) => {
        if (!user) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The user was upgraded! ");
            res.redirect("back");
        }
    }).catch(next);
});

//demote user
router.put("/:user_id/demoteuser", middleware.isAdmin, function (req, res, next) {
    console.log("PROFILES - EDIT ENABLE ");
    User.findByIdAndUpdate(req.params.user_id, {
        $inc: {
            role: -1
        }
    }).then((user) => {
        if (!user) {
            let err = new Error('Resource not found for User id: ' + req.params.user_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The user was upgraded! ");
            res.redirect("back");
        }
    }).catch(next);
});

function showResults(err, req, res, users, isSearch, pageNumber, perPage) {
    let countObj = {};
    let searchTerm = '';
    if (isSearch) {
        countObj = {
            $text: {
                $search: req.query.search
            }
        };
        searchTerm = req.query.search;
    }

    User.count(countObj).exec(function (err2, count) {
        if (err2) {
            req.flash("errror", "There was an error, really sorry. The error was: " + err2);
            console.log(err2);
        } else {
            if (err) {
                req.flash("errror", "There was an error, really sorry. The error was: " + err);
                console.log(err);
            } else {
                if (isSearch) {
                    if (users.length > 0) {
                        req.flash("success", +count + " User(s) have been found for your search term, showing page " + pageNumber + " of " + Math.ceil(count / perPage));
                    } else {
                        req.flash("error", "No Users(s) have been Found for that search term");
                    }

                }

                res.render('profiles/index', {
                    pagetitle: "Maintain Users",
                    page: 'users',
                    users: users,
                    pagnation: showpages(pageNumber, Math.ceil(count / perPage), searchTerm),
                    errMessages: req.flash('error'),
                    messages: req.flash('success'),

                });
            }
        }
    });
}

module.exports = router;