const express = require("express"),
    router = express.Router(),
    Link = require("../models/links"),
    Category = require("../models/categories"),
    Country = require("../models/countries"),
    User = require("../models/users"),
    middleware = require("../middleware"),
    showpages = require("../showware/pagnation"),
    webshot = require('node-webshot'),
    modmail = require("../utils/sendmodmail"),
    sanitizeHtml = require('sanitize-html');


//options for site thumbnail generation
const siteThumbOpts = {
    zoomFactor: 0.10,
    defaultWhiteBackground: true,
    streamType: 'jpeg',
    quality: 35,
    screenSize: {
        width: 140,
        height: 90
    },
    shotSize: {
        width: 140,
        height: 90
    },
    renderDelay: 1000,
    //    timeout: 8000,
    errorIfStatusIsNot200: false
};

const sanitizeOptions = {
    allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img'
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        // We don't currently allow img itself by default, but this
        // would make sense if we did
        img: ['src']
    },
    // Lots of these won't come up by default because we don't allow them
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    // URL schemes we permit
    allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
    allowedSchemesByTag: {
        img: ['data']
    },
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: true,
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
}

// Show All Links
router.get("/", function (req, res) {
    console.log("LINKS - INDEX ROUTE GET");
    const perPage = 12;
    const pageQuery = parseInt(req.query.page);
    const pageNumber = pageQuery ? pageQuery : 1;
    let addQuery = {};
    let searchTerm = "";
    const rawURLQuery = req.url.substr(req.url.indexOf('?') + 1);

    // do we need to add filters?

    if (req.query.category) {

        Object.assign(addQuery, {
            category: req.query.category.split('-')[0]
        }); // send in the name as well as id from select so we can show it in flash message
        searchTerm += ' Category: ' + req.query.category.split('-')[1]
    }
    if (req.query.country) {
        Object.assign(addQuery, {
            country: req.query.country.split('-')[0]
        }); // send in the name as well as id from select so we can show it in flash message
        searchTerm += ' Country: ' + req.query.country.split('-')[1]
    }

    if (req.query.search) {
        Object.assign(addQuery, {
            $text: {
                $search: req.query.search
            }
        });
        searchTerm += ' Search word(s): ' + req.query.search;
    }
    Category.find({
        disabled: false,
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Links'
        }]
    }).sort({
        'name': 1
    }).exec(function (err, cats) {
        if (err) {
            cats = null
        }
        Country.find({
            disabled: false
        }).sort({
            'name': 1
        }).exec(function (err, cnts) {
            if (err) {
                cnts = null
            }
            if (searchTerm && searchTerm.length > 0) {
                Link.find(addQuery).populate('category').populate('country').populate('createdby').skip((perPage * pageNumber) - perPage).sort({
                    'createdDate': -1
                }).limit(perPage).exec(function (err, nlinks) {
                    showResults(err, req, res, nlinks, cats, cnts, pageNumber, perPage, addQuery, searchTerm, rawURLQuery);
                });
            } else {
                Link.find({}).populate('category').populate('country').populate('createdby').skip((perPage * pageNumber) - perPage).sort({
                    'createdDate': -1
                }).limit(perPage).exec(function (err, nlinks) {
                    showResults(err, req, res, nlinks, cats, cnts, pageNumber, perPage);
                });
            }
        });
    });
});

// Add a Link
router.post("/", middleware.isLoggedIn, function (req, res, next) {
    //get data 
    console.log("CREATE LINK");
    let link = req.body.link;
    if (link.category.length === 0) {
        link.category = null
    }
    if (link.country.length === 0) {
        link.country = null
    }
    // console.log(link);
    link.description = sanitizeHtml(link.description, sanitizeOptions);
    //   console.log(link.description);
    Link.create(link).then((createdLink) => {
        if (!createdLink) {
            let err = new Error('Link could not be created ' + link);
            err.status = 500;
            next(err);
        } else {
            try {

                let img = [];
                let dataInt = 0;

                // mail mods
                try {
                    modmail(req, res, 'New Link Created on SleepSafe- please check ' + createdLink.name,
                        'A new link has been added, as a moderator or admin for the site you need to check links and spaces for spam.', '/links');
                } catch (merr) {
                    console.log('Mail error', merr);
                }
                try {
                    const renderStream = webshot(createdLink.link, siteThumbOpts);

                    renderStream.on('end', (data) => {
                        let newImg = '';
                        //         console.log(img.length);
                        for (let i = 0; i < img.length; i++) {
                            newImg = newImg + img[i];
                        }

                        createdLink.image = newImg;
                        //           console.log(img);
                        createdLink.save();
                    });
                    renderStream.on('data', (data) => {
                        img[dataInt] = data.toString('base64');
                        //           console.log('XXXXX');
                        dataInt++;
                    });
                } catch (imgerr) {
                    console.log(imgerr)
                }
                // update user to have a ref to link created
                User.findById(req.user._id, function (err, user) {
                    if (err) {
                        console.log(err)
                    } else {
                        user.linksSubmitted.push(createdLink);
                        user.save();
                        console.log('link saved to user');
                    }
                });
                createdLink.createdby = req.user._id;
                createdLink.save();
                req.flash("success", link.name + " has been created");
                res.redirect("/links");
            } catch (Exception) {
                let err = new Error(Exception);
                err.status = 500;
                next(err);
            }
        }
    }).catch(next);
});

// Get Add New Links Form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    console.log("NEW - NEW LINK POST");
    Category.find({
        disabled: false,
        $or: [{
            usedFor: 'Any'
        }, {
            usedFor: 'Links'
        }]
    }, function (err, categories) {
        if (err) {
            console.log(err);
        } else {
            Country.find({
                disabled: false
            }, function (err2, countries) {
                if (err2) {
                    console.log(err2);
                } else {
                    res.render("links/new", {
                        pagetitle: "Add a New Link",
                        categories: categories,
                        countries: countries
                    });
                }
            });
        }
    });
});

//edit link
router.get("/:id/edit", middleware.checkLinkOwnership, function (req, res, next) {

    Link.findById(req.params.id).then((foundLink) => {
        if (!foundLink) {
            let err = new Error('Link could not be found for link id ' + req.params.id);
            err.status = 404;
            next(err);
        }
        Category.find({
            disabled: false,
            $or: [{
                usedFor: 'Any'
            }, {
                usedFor: 'Links'
            }]
        }, function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                Country.find({
                    disabled: false
                }, function (err2, countries) {
                    if (err2) {
                        console.log(err2);
                    } else {
                        res.render("links/edit", {
                            pagetitle: "Edit Link",
                            link: foundLink,
                            categories: categories,
                            countries: countries
                        });
                    }
                });
            }
        });
    }).catch(next);
});

//update link
router.put("/:id/", middleware.checkLinkOwnership, function (req, res, next) {
    let link = req.body.link;
    if (link.category.length === 0) {
        link.category = null
    }
    if (link.country.length === 0) {
        link.country = null
    }
    Link.findOneAndUpdate({
        _id: req.params.id
    }, link).then((updatedLink) => {
        if (!updatedLink) {
            let err = new Error('Link could not be found for link id ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            // mail mods
            try {
                modmail(req, res, 'Link Edited on SleepSafe- please check ' + updatedLink.name,
                    'A link has been changed, as a moderator or admin for the site you need to check links and spaces for spam.', '/links');
            } catch (merr) {
                console.log('Mail error', merr);
            }

            //save additionals and redirect to sites
            try {
                let img = [];
                let dataInt = 0;
                const renderStream = webshot(updatedLink.link, siteThumbOpts);
                renderStream.on('end', (data) => {
                    let newImg = '';
                    // console.log(img.length);
                    for (let i = 0; i < img.length; i++) {
                        newImg = newImg + img[i];
                    }
                    if (img.length > 0) {
                        updatedLink.image = newImg;
                        //   console.log(img);
                        updatedLink.save();
                    }
                });
                renderStream.on('data', (data) => {
                    img[dataInt] = data.toString('base64');
                    dataInt++;
                    //    console.log('xxx')
                });
            } catch (e) {
                let err = new Error('Something went wrong adding the link ' + e);
                err.status = 500;
                next(err);
            }

            updatedLink.save();
            req.flash("success", "Your revisions were successful for " + updatedLink.name);
            res.redirect("/links");
        }
    }).catch(next);
});

//distroy, link
router.delete("/:id", middleware.checkLinkOwnership, function (req, res, next) {

    Link.remove({
        _id: req.params.id
    }).then((deletedID) => {
        if (!deletedID) {
            let err = new Error('Link could not be found during delete for link id ' + req.params.id);
            err.status = 404;
            next(err);
        } else {
            // update user to remove count-1 to link created
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    console.log(err)
                } else {
                    user.sitesSubmitted.pull(req.params.id);
                    user.save();
                    //   console.log('link removed from user');
                }
            });
            req.flash("success", "Delete successful");
            res.redirect("/links");
        }
    }).catch(next);
});

function showResults(err, req, res, links, cats, cnts, pageNumber, perPage, addQuery, searchTerm, rawURLQuery) {
    let countObj = {};

    if (searchTerm && searchTerm.length > 0) {
        countObj = addQuery;
        searchTerm = searchTerm;
    }

    Link.countDocuments(countObj).exec(function (err2, count) {
        if (err2) {
            req.flash("errror", "There was an error, really sorry. The error was: " + err2);
            console.log(err2);
        } else {
            if (err) {
                req.flash("errror", "There was an error, really sorry. The error was: " + err);
                console.log(err);
            } else {
                if (searchTerm && searchTerm.length > 0) {
                    if (links.length > 0) {
                        req.flash("success", +count + " Links(s) have been found for your search, " + searchTerm + " showing page " + pageNumber + " of " + Math.ceil(count / perPage));
                    } else {
                        req.flash("error", "No Links(s) have been Found for search " + searchTerm);
                    }
                }
                //console.log(rawURLQuery)
                res.render('links/index', {
                    pagetitle: "Links",
                    page: 'links',
                    links: links,
                    cats: cats,
                    cnts: cnts,
                    pagnation: showpages(pageNumber, Math.ceil(count / perPage), rawURLQuery, 'links'),
                    errMessages: req.flash('error'),
                    messages: req.flash('success'),
                });
            }
        }
    });
}

module.exports = router;