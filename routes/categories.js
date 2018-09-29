const express = require("express"),
    router = express.Router({
    mergeParams: true
}),
    Category = require("../models/categories"),
    showpages = require("../showware/pagnation"),
    middleware = require("../middleware");

// Show All catigories
router.get("/", middleware.isModerator, function (req, res) {
    console.log("CATEGORIES - INDEX ROUTE GET");
    var perPage = 24;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        Category.find({
            $text: {
                $search: req.query.search
            }
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, ncats) {
            showResults(err, req, res, ncats, true, pageNumber, perPage);
        });
    } else {
        Category.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, ncats) {
            showResults(err, req, res, ncats, false, pageNumber, perPage);
        });
    }
});

// edit category form

router.get("/:cat_id/edit", middleware.isModerator, function (req, res, next) {
    console.log("Category - EDIT GET ");
    Category.findById(req.params.cat_id).then((cat) => {
        if (!cat) {
            let err = new Error('Resource not found for Category id: ' + req.params.cat_id);
            err.status = 404;
            next(err);
        } else {
            res.render('categories/edit', {
                pagetitle: "Sleep Safe - Edit Category",
                cat: cat,
                page: 'editcat'
            });
        }
    }).catch(next);
});

// new category
router.get("/new", middleware.isModerator, function (req, res, next) {
    console.log("Category - NEW GET ");

    res.render('categories/new', {
        pagetitle: "Sleep Safe - Add Category",
        page: 'newcat'
    });

});

//add category
router.post("/", middleware.isModerator, function (req, res, next) {
    console.log(" Category - PUT UPDATE ");
    Category.create(req.body.cat).then((addedCat) => {
        if (!addedCat) {
            let err = new Error('Resource not created for Category!');
            err.status = 500;
            next(err);
        } else {

            req.flash("success", "Category added!");
            res.redirect("/categories");

        }
    }).catch(next);
});

//update category
router.put("/:cat_id", middleware.isModerator, function (req, res, next) {
    console.log(" Category - PUT UPDATE ");
    if (!req.body.cat.disabled) {
        req.body.cat.disabled = false;
    }
    Category.findByIdAndUpdate(req.params.cat_id, req.body.cat).then((updateCat) => {
        if (!updateCat) {
            let err = new Error('Resource not found for Category id: ' + req.params.cat_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "Category updated!");
            res.redirect("/categories");
        }
    }).catch(next);
});

//disable category
router.put("/:cat_id/disable", middleware.isModerator, function (req, res, next) {
    console.log("Category - EDIT DISABLE ");
    Category.findByIdAndUpdate(req.params.cat_id, {
        'disabled': true
    }).then((disabledCat) => {
        if (!disabledCat) {
            let err = new Error('Resource not found for Category id: ' + req.params.cat_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The Category was disabled! ");
            res.redirect("/categories");
        }
    }).catch(next);
});

//enable category
router.put("/:cat_id/enable", middleware.isModerator, function (req, res, next) {
    console.log("Category - EDIT ENABLE ");
    Category.findByIdAndUpdate(req.params.cat_id, {
        'disabled': false
    }).then((enabledCat) => {
        if (!enabledCat) {
            let err = new Error('Resource not found for Category id: ' + req.params.cat_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The category was enabled! ");
            res.redirect("/categories");
        }
    }).catch(next);
});

function showResults(err, req, res, cats, isSearch, pageNumber, perPage) {
    var countObj = {};
    var searchTerm = '';
    if (isSearch) {
        countObj = {
            $text: {
                $search: req.query.search
            }
        };
        searchTerm = req.query.search;
    }

    Category.count(countObj).exec(function (err2, count) {
        if (err2) {
            req.flash("errror", "There was an error, really sorry. The error was: " + err2);
            console.log(err2);
        } else {
            if (err) {
                req.flash("errror", "There was an error, really sorry. The error was: " + err);
                console.log(err);
            } else {
                if (isSearch) {
                    if (cats.length > 0) {
                        req.flash("success", +count + " Category(s) have been found for your search term, showing page " + pageNumber + " of " + Math.ceil(count / perPage));
                    } else {
                        req.flash("error", "No Category(s) have been Found for that search term");
                    }

                }
                res.render('categories/index', {
                    pagetitle: "Sleep Safe - Maintain Categories",
                    page: 'cats',
                    cats: cats,
                    pagnation: showpages(pageNumber, Math.ceil(count / perPage), searchTerm),
                    errMessages: req.flash('error'),
                    messages: req.flash('success'),

                });
            }
        }
    });
}


module.exports = router;