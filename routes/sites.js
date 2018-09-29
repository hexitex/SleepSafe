const express = require("express"),
    router = express.Router(),
    Site = require("../models/sites"),
    User = require("../models/users"),
    Category = require("../models/categories"),
    Country = require("../models/countries"),
    middleware = require("../middleware"),
    showicons = require("../showware/showicons"),
    showpages = require("../showware/pagnation"),
    stars = require("../showware/starrating"),
    isImage = require('is-image'),
    modmail = require('../utils/sendmodmail');

// Show All Sites
router.get("/", function (req, res) {
    //   console.log("SITES - INDEX ROUTE GET");
    const perPage = 12;
    const pageQuery = parseInt(req.query.page);
    const pageNumber = pageQuery ? pageQuery : 1;
    let addQuery = {};
    let searchTerm = "";
    const rawURLQuery = req.url.substr(req.url.indexOf('?') + 1);
    //console.log(rawURLQuery);

    // do we need to add filters
    if (req.query.category) {
        Object.assign(addQuery, {
            category: req.query.category.split('-')[0]
        }); // do this so we have a cat name to show in flash without having to lookup again
        searchTerm += ' Category =' + req.query.category.split('-')[1];
    }
    if (req.query.country) {
        Object.assign(addQuery, {
            country: req.query.country.split('-')[0]
        }); // do this so we have a cntry name to show in flash without having to lookup again
        searchTerm += ' Country =' + req.query.country.split('-')[1];
    }
    if (req.query.rating) {
        Object.assign(addQuery, {
            rating: {
                $gte: req.query.rating
            }
        });
        searchTerm += ' Rating >' + req.query.rating;
    }
    if (req.query.dogs) {
        Object.assign(addQuery, {
            dog: req.query.dogs
        });
        searchTerm += ' Dogs Allowed=' + req.query.dogs;
    }
    if (req.query.water) {
        Object.assign(addQuery, {
            water: req.query.water
        });
        searchTerm += ' Has Water=' + req.query.water;
    }
    if (req.query.power) {
        Object.assign(addQuery, {
            charging: req.query.power
        });
        searchTerm += ' Has Power=' + req.query.power;
    }
    if (req.query.warm) {
        Object.assign(addQuery, {
            warm: req.query.warm
        });
        searchTerm += ' Is Warm=' + req.query.warm;
    }
    if (req.query.shelter) {
        Object.assign(addQuery, {
            shelter: req.query.shelter
        });
        searchTerm += ' Has Shelter=' + req.query.shelter;
    }
    if (req.query.food) {
        Object.assign(addQuery, {
            food: req.query.food
        });
        searchTerm += ' Food Availble=' + req.query.water;
    }
    if (req.query.wash) {
        Object.assign(addQuery, {
            wash: req.query.wash
        });
        searchTerm += ' Washing Facilities=' + req.query.wash;
    }
    if (req.query.search) {
        Object.assign(addQuery, {
            $text: {
                $search: req.query.search
            }
        });
        searchTerm += req.query.search;
    }

    if (searchTerm && searchTerm.length > 0) { // filters used
        Site.find(addQuery).skip((perPage * pageNumber) - perPage).sort({
            'createdDate': -1
        }).limit(perPage).exec(function (err, nsites) {
            showResults(err, req, res, nsites, pageNumber, perPage, addQuery, searchTerm, rawURLQuery);
        });
    } else { // no filters used
        Site.find({}).skip((perPage * pageNumber) - perPage).sort({
            'createdDate': -1
        }).limit(perPage).exec(function (err, nsites) {
            showResults(err, req, res, nsites, pageNumber, perPage);
        });
    }
});

// Add a Site
router.post("/", middleware.isLoggedIn, function (req, res, next) {
    //get data 
    console.log("CREATE POST");
    let site = req.body.site;
    if (site.category.length === 0) {
        site.category = null
    }
    if (site.country.length === 0) {
        site.country = null
    }
    Site.create(site).then((createdSite) => {
        if (!createdSite) {
            let err = new Error('Site could not be created ' + site);
            err.status = 500;
            next(err);
        } else {
            try {
                // mail mods about change
                try {
                    modmail(req, res, 'New Space Created on SleepSafe- Please Check : ' + createdSite.name,
                        'A New SleepSafe Space has been added, as a moderator or admin for SleepSafe.space you need to please check links and spaces for spam.', '/sites/' + createdSite._id);
                } catch (merr) {
                    console.log('Mail error', merr);
                }

                //save additionals and redirect to sites
                req.body.addImage.forEach(function (img) {
                    if (img.length > 0) {
                        createdSite.moreImages.push(img);
                    }
                });

                req.body.addImageThumbnail.forEach(function (img) {
                    if (img.length > 0) {
                        createdSite.moreImagesThumbnails.push(img);
                    }
                });
                // update user to have a ref to link created
                User.findById(req.user._id, function (err, user) {
                    if (err) {
                        console.log(err)
                    } else {
                        user.sitesSubmitted.push(createdSite);
                        user.save();
                        console.log('site saved to user');
                    }
                });
                createdSite.createdby = req.user._id;
                createdSite.save();
                req.flash("success", req.body.site.name + " has been created");
                res.redirect("/sites");
            } catch (Exception) {
                let err = new Error('Problem adding site ' + Exception);
                err.status = 500;
                next(err);
            }
        }
    }).catch(next);
});

// Get Add New Site Form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    console.log("NEW - NEW ROUTE POST");
    Category.find({
        disabled: false,
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Sites'
        }]
    }, function (err, cats) {
        if (err) {
            console.log(err)
        } else {
            Country.find({
                disabled: false
            }, function (err, cnts) {
                if (err) {
                    console.log(err)
                } else {

                    res.render("sites/new", {
                        pagetitle: "Add a New Site",
                        maxAdditionalImages: 5,
                        mapCallback: 'initMapAdd',
                        stars: stars(null, 5, false),
                        cats: cats,
                        cnts: cnts

                    });
                }
            });
        }
    });
});

//Show more information about Site
router.get("/:id", function (req, res, next) {
    console.log("SITES- SHOW GET");
    Category.find({
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Sites'
        }]
    }, function (err, cats) {
        if (err) {
            console.log(err);
        } else {
            Country.find({}, function (err, cnts) {
                if (err) {
                    console.log(err);
                } else {
                    Site.findById(req.params.id).populate({
                        path: 'comments',
                        populate: {
                            path: 'author'
                        }
                    }).populate('createdby').populate('category').populate('country').then((result) => {
                        if (!result) {
                            let err = new Error('Resource not found for Space id: ' + req.params.id);
                            err.status = 404;
                            next(err);
                        } else {
                            res.render("sites/show", {
                                pagetitle: "Show Site",
                                site: result, //.toObject(),
                                icons: showicons(result),
                                isImage: isImage,
                                stars: stars(result, 5, false),
                                page: 'sites',
                                cats: cats,
                                cnts: cnts
                            });
                        }
                    }).catch(next);
                }
            });
        }
    });
});

//edit site
router.get("/:id/edit", middleware.checkSiteOwnership, function (req, res, next) {
    Category.find({
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Sites'
        }]
    }, function (err, cats) {
        if (err) {
            console.log(err);
        } else {
            Country.find({}, function (err, cnts) {
                if (err) {
                    console.log(err);
                } else {
                    Site.findById(req.params.id).then((foundSite) => {
                        if (!foundSite) {
                            let err = new Error('Resource not found for Space id: ' + req.params.id);
                            err.status = 404;
                            next(err);
                        } else {
                            res.render("sites/edit", {
                                pagetitle: "Edit Site",
                                site: foundSite,
                                maxAdditionalImages: 5,
                                mapCallback: 'initMapEdit',
                                stars: stars(foundSite, 5, false),
                                // page: 'sites',
                                cats: cats,
                                cnts: cnts
                            });
                        }
                    }).catch(next);
                }
            });
        }
    });
});

//update site
router.put("/:id/", middleware.checkSiteOwnership, function (req, res, next) {
    if (req.body.site.category.length === 0) {
        req.body.site.category = null
    }
    if (req.body.site.country.length === 0) {
        req.body.site.country = null
    }
    Site.findOneAndUpdate({
        _id: req.params.id
    }, req.body.site).then((updated) => {
        if (!updated) {
            let err = new Error('Resource not updated for Space id: ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            try {
                modmail(req, res, 'A Space has been Edited on SleepSafe- please check ' + updated.name,
                    'A Space has been edited, as a moderator or admin for SleepSafe.space you need to check links and spaces for spam.', '/sites/' + updated._id);
            } catch (merr) {
                console.log('Mail error', merr);
            }
            //save additionals and redirect to sites
            updated.moreImages = []; //clear
            updated.moreImagesThumbnails = []; //clear 

            req.body.addImage.forEach(function (img, i) {
                if (img.length > 0) {

                    updated.moreImages.push(img);
                }
            });

            req.body.addImageThumbnail.forEach(function (img, i) {
                if (img.length > 0) {

                    updated.moreImagesThumbnails.push(img);
                }
            });
            updated.save();
            req.flash("success", "Your revisions were successful for " + updated.name);
            res.redirect("/sites/" + updated._id);
        }

    }).catch(next);

});

//distroy, site comments will be deleted automatically via the site schema
router.delete("/:id", middleware.checkSiteOwnership, function (req, res, next) {

    //Site.removeSite(req.params.id).then((deleted) => {
    Site.remove({
        _id: req.params.id
    }).then((deleted) => {
        if (!deleted) {
            let err = new Error('Resource not deleted for Space id: ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            // update user to remove ref to site created
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    console.log(err)
                } else {
                    user.sitesSubmitted.pull(req.params.id);
                    user.save();
                    console.log('site deleted from user');
                }
            });
            req.flash("success", "Delete successful");
            res.redirect("/sites");
        }
    }).catch(next);
});

function showResults(err, req, res, sites, pageNumber, perPage, addQuery, searchTerm, rawURLQuery) {
    let countObj = {};
    if (err) {
        console.log(err)
    }

    if (searchTerm && searchTerm.length > 0) {
        countObj = addQuery;
        searchTerm = searchTerm;
    }
    Category.find({
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Sites'
        }]
    }, function (err, cats) {
        if (err) {
            console.log(err);
        } else {
            Country.find({}, function (err, cnts) {
                if (err) {
                    console.log(err);
                } else {
                    Site.count(countObj).exec(function (err2, count) {
                        if (err2) {
                            req.flash("errror", "There was an error, really sorry. The error was: " + err2);
                            console.log(err2);
                        } else {
                            if (err) {
                                req.flash("errror", "There was an error, really sorry. The error was: " + err);
                                console.log(err);
                            } else {
                                if (searchTerm && searchTerm.length > 0) {
                                    if (sites.length > 0) {
                                        req.flash("success", +count + " Space(s) have been found for your search, " + searchTerm + " showing page " + pageNumber + " of " + Math.ceil(count / perPage));
                                    } else {
                                        req.flash("error", "No Space(s) have been Found for search " + searchTerm);
                                    }

                                }
                                //console.log(rawURLQuery)
                                res.render('sites/index', {
                                    pagetitle: "Spaces",
                                    page: 'sites',
                                    sites: sites,
                                    icons: showicons(sites),
                                    stars: stars(sites, 5, true),
                                    pagnation: showpages(pageNumber, Math.ceil(count / perPage), rawURLQuery, 'sites'),
                                    errMessages: req.flash('error'),
                                    messages: req.flash('success'),
                                    cats: cats,
                                    cnts: cnts
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

module.exports = router;