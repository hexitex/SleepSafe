var Site = require("../models/sites");
var Link = require("../models/links");
var Comment = require("../models/comments");
var User = require("../models/users");
// all middleware goes here
var middlewareObj = {};
// checks sites ownership for edit delete
middlewareObj.checkSiteOwnership = function(req, res, next) {
    var type = 0;
    if (req.isAuthenticated()) {

        User.findById(req.user._id, function(err, user) {
            if (err) {
                let err = new Error('Resource not found for User id: ' + req.user._id);
                err.status = 404;
                next(err);
            }
            else {
                if (user.role > 0 && !user.disabled) {
                    type = 1;
                }
                if (req.isAuthenticated()) {
                    Site.findById(req.params.id).then((foundSite) => {
                        if (!foundSite) {
                            let err = new Error('Resource not found for Space id: ' + req.params.id);
                            err.status = 404;
                            next(err);
                        }
                        else {
                            if (foundSite.createdby._id.equals(req.user._id) || type === 1) {
                                return next();
                            }
                            else {
                                req.flash("error", "This is not your site to edit or delete!");
                                res.redirect('/sites');
                            }
                        }

                    }).catch(next);
                }
            }
        });
    }
    else {
        req.flash("error", "Sorry there is a problem, you may have been logged out, try logging in again");
        res.redirect('/sites');

    }
};
//checks comment onwership for edit delete
middlewareObj.checkCommentOwnership = function(req, res, next) {
    var type = 0;
    if (req.isAuthenticated()) {

        User.findById(req.user._id, function(err, user) {
            if (err) {
                let err = new Error('User not found for id: ' + req.user._id);
                err.status = 404;
                next(err);
            }
            else {
                if (user.role > 0 && !user.disabled) {
                    type = 1;
                }
            }
        });

        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id).then((foundComment) => {
                if (!foundComment) {
                    let err = new Error('Resource not found for comment id: ' + req.params.comment_id);
                    err.status = 404;
                    next(err);
                }
                else {

                    if (foundComment.author._id.equals(req.user._id) || type === 1) {
                        return next();
                    }
                    else {
                        req.flash("error", "This is not your comment to edit or delete!");
                        res.redirect('/sites');
                    }
                }
            }).catch(next);
        }

    }
    else {
        req.flash("error", "Sorry there is a problem, you may have been logged out, try logging in again");
        res.redirect('/sites');
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
};

middlewareObj.isAdmin = function(req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.user._id).then((user) => {
            if (!user) {
                let err = new Error('Resource not found for user id: ' + req.user._id);
                err.status = 404;
                next(err);
            }
            else {
                if (user.role === 2 && !user.disabled) {
                    return next();
                }
                else {
                    req.flash("error", "You are not an Admin!");
                    res.redirect("back");
                }
            }
        }).catch(next);
    }
    else {
        req.flash("error", "You are not logged in!");
        res.redirect("/login");
    }
};

middlewareObj.isModerator = function(req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.user._id).then((user) => {
            if (!user) {
                let err = new Error('Resource not found for user id: ' + req.user._id);
                err.status = 404;
                next(err);
            }
            else {
                if (user.role > 0 && !user.disabled) {
                    return next();
                }
                else {
                    req.flash("error", "You are not an Moderator!");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You are not logged in!");
        res.redirect("/login");
    }
};

middlewareObj.checkUserEditAllowed = function(req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.user._id).then((user) => {
            if (!user) {
                let err = new Error('Resource not found for user id: ' + err);
                err.status = 404;
                next(err);
            }
            else {
                if ((user._id.equals(req.user._id) || user.role > 0) && !user.disabled) {
                    return next();
                }
                else {
                    req.flash("error", "You are not allowed to edit other users!");
                    res.redirect('/sites');
                }
            }
        }).catch(next);
    }
    else {
        req.flash("error", "You are not logged in!");
        res.redirect('/login');
    }
};

// checks sites ownership for edit delete
middlewareObj.checkLinkOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        var type = 0;
        User.findById(req.user._id, function(err, user) {
            if (err) {
                let err = new Error('User not found for id: ' + err);
                err.status = 404;
                next(err);
            }
            else {
                if (user.role > 0 && !user.disabled) {
                    type = 1;
                }
                if (req.isAuthenticated()) {
                    Link.findById(req.params.id).then((foundLink) => {
                        if (!foundLink) {
                            let err = new Error('Resource not found for Link id: ' + req.params.id);
                            err.status = 404;
                            next(err);
                        }
                        else {
                            if (foundLink.createdby._id.equals(req.user._id) || type === 1) {
                                return next();
                            }
                            else {
                                req.flash("error", "This is not your link to edit or delete!");
                                res.redirect('back');
                            }

                        }
                    }).catch(next);
                }
                else {
                    req.flash("error", "you are not logged in");
                    res.redirect('/login');
                }
            }
        });
    }
    else {
        req.flash("error", "Sorry there is a problem, you may have been logged out, try logging in again");
        res.redirect('/sites');
    }

};

module.exports = middlewareObj;