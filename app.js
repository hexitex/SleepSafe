const express = require("express"),
    app = express(),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    User = require("./models/users"),
    session = require("express-session"),
    RedisStore = require("connect-redis")(session),
    flash = require("connect-flash"),
    os = require("os"),
    cluster = require("cluster"), 
    path = require('path'),
    serveStatic = require('serve-static');


    // get route files    
    const commentRoutes = require("./routes/comments"),
        authRoutes = require("./routes/auth"),
        siteRoutes = require("./routes/sites"),
        linkRoutes = require("./routes/links"),
        profileRoutes = require("./routes/profiles"),
        countryRoutes = require("./routes/countries"),
        categoryRoutes = require("./routes/categories");

    // connect to DB
    mongoose.connect("mongodb://localhost/sites");

    //config static resources
    app.use(serveStatic(path.join(__dirname, 'public'), {
        maxAge: '5d',
        setHeaders: setCustomCacheControl
      }))

    let d = new Date();
    d.setDate(d.getDate() + 50); // 
    // config passport options
    app.use(session({
        store: new RedisStore({
            host: '127.0.0.1',
            port: 6379
        }),
        cookie: {
            maxAge: 31 * 24 * 60 * 60 * 1000
        },
        secret: process.env.PASSPORTSECRET,
        resave: false,
        saveUninitialized: false
    }));

    // flash messages
    app.use(flash());

    //set up passport
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());



    //config ejs bodyparser and public
    app.set("view engine", "ejs");
    app.use(express.static(__dirname + "/public"));
    
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));
    app.use(methodOverride("_method"));
    app.locals.moment = require('moment');


    // let everything have currentUser and flash messages
    app.use(function (req, res, next) {
        res.locals.currentUser = req.user;
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    });

    // populate DB with some test data
    //SeedDb();

    try {
        //routes
        app.use("/sites", siteRoutes);
        app.use("/sites/:id/comments", commentRoutes);
        app.use("/profiles", profileRoutes);
        app.use("/countries", countryRoutes);
        app.use("/categories", categoryRoutes);
        app.use("/links", linkRoutes);
        app.use(authRoutes);
    } catch (exception) {
        console.log(exception)
    }

    // handle errors
    app.use(function (err, req, res, next) {

        res.locals.message = err.message;
        res.locals.error = err;

        if (err.kind === 'ObjectId') {
            err.status = 404;
        }

        // render the error page
        res.status(err.status || 500); //.send("Could not find the ID")

        console.log(err)
        res.render('errors/errors', {
            pagetitle: 'Sleep Safe - Error',
            err: err
        });
    });


if (cluster.isMaster) {
    const cpuCount = os.cpus().length
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork()
    }
} 

else {
    // start the server
    app.listen(3001, '0.0.0.0', function () {
        console.log('Sleep-Safe Server Started');
    });
}
function setCustomCacheControl (res, path) {
    if (serveStatic.mime.lookup(path) === 'img/jpeg') {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=5')
    }
  }
cluster.on('exit', (worker) => {
    console.log('mayday! mayday! worker', worker.id, ' is no more!')
    cluster.fork()
});