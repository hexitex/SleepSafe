const express = require("express"),
router = express.Router({
    mergeParams: true
}),
Site = require("../models/sites"),
Comment = require("../models/comments"),
User = require("../models/users"),
middleware = require("../middleware");

// add new comment

router.post("/", middleware.isLoggedIn, function (req, res, next) {
    //get data 
    console.log("CREATE COMMENT POST");
    Site.findById(req.params.id).then((site) => {
        if (!site) {
            let err = new Error('Resource not found during Add comment for Space id: ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            Comment.create({
                'text': req.body.comment
            }, function (err, comment) {
                if (err) {
                    req.flash("error", "There was an error creating the comment! We are very sorry, please try again.");
                    console.log(err);
                } else {
                    //add user id
                    comment.author = req.user._id;
                    comment.save();
                    site.comments.push(comment);
                    site.save();
                    // update user to have a ref to link created
                    User.findById(req.user._id, function (err, user) {
                        if (err) {
                            console.log(err)
                        } else {
                            user.commentsMade.push(comment);
                            user.save();
                            console.log('saved to user');
                        }
                    });

                    req.flash("success", "New comment added to " + site.name);
                    //redirect to campground
                    res.redirect("/sites/" + site._id);
                }
            });
        }
    }).catch(next);
});

//update comment
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res, next) {
    console.log(req.params.comment_id + " COMMENTS - PUT UPDATE ");
    Comment.findByIdAndUpdate(req.params.comment_id, {
        'text': req.body.comment
    }).then((updatedComment) => {
        if (!updatedComment) {
            let err = new Error('Resource not found for Comment id: ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "Comment updated, thanks!");
            res.redirect("/sites/" + req.params.id);
        }
    }).catch(next);
});

//distroy comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res, next) {
    console.log("COMMENTS - EDIT DELETE ");
    Comment.findByIdAndDelete(req.params.comment_id).then((deletedComment) => {
        if (!deletedComment) {
            let err = new Error('Resource not found during delete for Comment id: ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            // update user to remove ref to site created
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    console.log(err)
                } else {
                    try {
                        user.commentsMade.pull(req.params.comment_id);
                        user.save();
                        // console.log("removed comment from user")
                    } catch (re) {
                        console.log(re)
                    }
                }
            });
            req.flash("success", "Your comment was deleted! ");
            res.redirect("/sites/" + req.params.id);
        }
    }).catch(next);
});

module.exports = router;