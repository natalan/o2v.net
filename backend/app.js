// TODO: remove istanbul ignores
var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    config = require("./config/index"),
    _ = require("underscore");

var apiUsers = require("./routes/users"),
    apiIndex = require("./routes/index");

var app = express();

app.disable("x-powered-by");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hjs");

// TODO: add CSRF from https://github.com/expressjs/csurf
app.get('/*', function(req, res, next) {
    if (req.headers.host.indexOf("o2v-net.herokuapp.com") !== -1 ) {
        res.redirect(301, "http://" + req.headers.host.replace("o2v-net.herokuapp.com", "www.o2v.net") + req.url);
    } else {
        next();
    }
});

app.use(require("serve-favicon")(path.join(path.dirname(__dirname),  "frontend/favicon.ico")));
app.use(require("morgan")(config.get("app.logFormat")));
app.use(require("cookie-parser")());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// prevent page being iframe protection
app.use(function (req, res, next) {
    res.header("X-FRAME-OPTIONS", "SAMEORIGIN");
    next();
});

// lessMiddleware(source, [{options}], [{parserOptions}], [{compilerOptions}])
app.use(require("less-middleware")(path.join(path.dirname(__dirname), "frontend"), {}, {}, {
    compress: true,
    force: true
}));

// https://github.com/expressjs/compression
// gzip compression. response is only compressed if the byte size is at or above this threshold
app.use(require("compression")({
    threshold: 512
}));

app.use(express.static(path.join(path.dirname(__dirname), "frontend")));
// allow crossdomain options request
/* istanbul ignore next */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");

    // intercept OPTIONS method
    if ("OPTIONS" == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

// REST Services
app.get("/", apiIndex.getRoot);
app.get("/version", apiIndex.getVersion);
app.get("/health", apiIndex.getHealth);

// obsolete redirects
app.get("/blog/jquery-formlabels-plugin", function(req, res) {
    res.redirect(301, "https://github.com/natalan/jquery.formLabels");
});
app.get("/demo/:id", function(req, res) {
    res.redirect(301, "/files/demo/" + req.params.id);
});

// if not picked any route then show homepage and forward to error handler
/* istanbul ignore next */
app.use(function(req, res, next) {
    res.redirect(301, "/");
});

// error handlers

// development error handler
// will print stacktrace
if (config.get("env") == "localhost") {
    /* istanbul ignore next */
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    /* istanbul ignore next */
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: {}
        });
    });

}



module.exports = app;