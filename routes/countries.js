const express = require("express"),
    router = express.Router({
        mergeParams: true
    }),
    Country = require("../models/countries"),
    showpages = require("../showware/pagnation"),
    middleware = require("../middleware");

    // Show All countries
    router.get("/", middleware.isModerator, function (req, res) {
        console.log("Country - INDEX ROUTE GET");
        const perPage = 24;
        const pageQuery = parseInt(req.query.page);
        const pageNumber = pageQuery ? pageQuery : 1;
        if (req.query.search) {
            Country.find({
                $text: {
                    $search: req.query.search
                }
            }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, ncats) {
                showResults(err, req, res, ncats, true, pageNumber, perPage);
            });
        } else {
            Country.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, ncats) {
                showResults(err, req, res, ncats, false, pageNumber, perPage);
            });
        }
    });



// new country
router.get("/new", middleware.isModerator, function (req, res, next) {
    console.log("Country - NEW GET ");

    res.render('countries/new', {
        pagetitle: "Sleep Safe - Add Country",
        page: 'newcnt'
    });

});

//add country
router.post("/", middleware.isModerator, function (req, res, next) {
    console.log(" Category - PUT UPDATE ");
    Country.create(req.body.cnt).then((addedCnt) => {
        if (!addedCnt) {
            let err = new Error('Resource not created for Country!');
            err.status = 500;
            next(err);
        } else {

            req.flash("success", "Country added!");
            res.redirect("./");

        }
    }).catch(next);
});

// edit country form

router.get("/:cnt_id/edit", middleware.isModerator, function (req, res, next) {
    console.log("Country - EDIT GET ");
    Country.findById(req.params.cnt_id).then((cnt) => {
        if (!cnt) {
            let err = new Error('Resource not found for Country id: ' + req.params.cnt_id);
            err.status = 404;
            next(err);
        } else {
            res.render('countries/edit', {
                pagetitle: "Sleep Safe - Edit Country",
                cnt: cnt,
                page: 'editcat'
            });
        }
    }).catch(next);
});

//update country
router.put("/:cnt_id", middleware.isModerator, function (req, res, next) {
    console.log("Country - PUT UPDATE ");
    Country.findByIdAndUpdate(req.params.cnt_id, req.body.cnt).then((updateCnt) => {
        if (!updateCnt) {
            let err = new Error('Resource not found for Country id: ' + req.params.cnt_id);
            err.status = 404;
            next(err);
        } else {

            req.flash("success", "Country updated!");
            res.redirect("./");

        }
    }).catch(next);
});

//disable country
router.put("/:cnt_id/disable", middleware.isModerator, function (req, res, next) {
    console.log("Country - EDIT DISABLE ");
    Country.findByIdAndUpdate(req.params.cnt_id, {
        'disabled': true
    }).then((disabledCnt) => {
        if (!disabledCnt) {
            let err = new Error('Resource not found for Country id: ' + req.params.cnt_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The Country was disabled! ");
            res.redirect("back");
        }
    }).catch(next);
});

//enable country
router.put("/:cnt_id/enable", middleware.isModerator, function (req, res, next) {
    console.log("Country - EDIT ENABLE ");
    Country.findByIdAndUpdate(req.params.cnt_id, {
        'disabled': false
    }).then((enabledCnt) => {
        if (!enabledCnt) {
            let err = new Error('Resource not found for Country id: ' + req.params.cnt_id);
            err.status = 404;
            next(err);
        } else {
            req.flash("success", "The Country was enabled! ");
            res.redirect("back");
        }
    }).catch(next);
});

function showResults(err, req, res, cnts, isSearch, pageNumber, perPage) {
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

    Country.count(countObj).exec(function (err2, count) {
        if (err2) {
            req.flash("errror", "There was an error, really sorry. The error was: " + err2);
            console.log(err2);
        } else {
            if (err) {
                req.flash("errror", "There was an error, really sorry. The error was: " + err);
                console.log(err);
            } else {
                if (isSearch) {
                    if (cnts.length > 0) {
                        req.flash("success", +count + " Country(s) have been found for your search term, showing page " + pageNumber + " of " + Math.ceil(count / perPage));
                    } else {
                        req.flash("error", "No Country(s) have been Found for that search term");
                    }

                }
                res.render('countries/index', {
                    pagetitle: "Sleep Safe - Maintain Country(s)",
                    page: 'cnts',
                    cnts: cnts,
                    pagnation: showpages(pageNumber, Math.ceil(count / perPage), searchTerm),
                    errMessages: req.flash('error'),
                    messages: req.flash('success'),

                });
            }
        }
    });
}


module.exports = router;