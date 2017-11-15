// server.js
// only thing that ever needs to be changed is IP address of 'host' in pool variable to location of server computer

var mysql = require('mysql');
var rest = require("./REST.js");
var morgan = require("morgan");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var express = require('express');
var bodyParser = require("body-parser"); // Body parser for fetch posted data
var app = express();
var connection = null;

app.set('view engine', 'ejs');

app.use(express.static("public"));

passport.use(new LocalStrategy(
  function(username, password, done) {
    connection.query("SELECT * FROM users WHERE username=" + JSON.stringify(username) + "", function(err, rows) {
      console.log(rows[0]);
      if(err) { return done(err); }
      if(!rows[0]) { return done(null, false); }
      if(rows[0].password != password) { return done(null, false); }
      return done(null, rows[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  console.log(username);
  connection.query("SELECT * FROM users WHERE username=" + JSON.stringify(username) + "", function(err, rows) {
    if(err) return done(err);
    done(err, rows[0]);
  });
});

function REST()
{
    var self = this;
    self.connectMysql();
}

REST.prototype.connectMysql = function()
{
    var self = this;

    /*var pool = mysql.createPool({
        connectionLimit: 100,
        host     : '127.0.0.1',
        user     : 'root',
        password : '',
        database : 'frcscout2017',
        debug    : false
    });*/
    /* DEPLOY ONLY*/

     var pool = mysql.createPool({
        connectionLimit: 100,
        host     : 'sql9.freemysqlhosting.net',
        user     : 'sql9204849',
        password : 'FkqqHCpm7M',
        database : 'sql9204849',
        debug    : false
    });
    pool.getConnection(function(err, connection) {
        if(err)
            self.stop(err);
        else
            self.configureExpress(connection);
    });
}

REST.prototype.configureExpress = function(connect)
{
    var self = this;
    connection = connect;
    app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(morgan("dev"));
    // app.use(multer({dest: "public/images"}));
    var router = express.Router();
    app.use('/', router);
    var rest_router = new rest(router, connection, passport);
    self.startServer();
}

REST.prototype.startServer = function()
{
    var port = Number(process.env.PORT || 8000);
    app.listen(port, function() {
        console.log('FRC Scout servers running on port 8000');
    });
}

REST.prototype.stop = function(err)
{
    console.log("MYSQL ERROR THROWN: \n" + err);
    process.exit(1);
}

new REST();
