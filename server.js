// server.js
// only thing that ever needs to be changed is IP address of 'host' in pool variable to location of server computer

var mysql = require('mysql');
var rest = require("./REST.js");
var morgan = require("morgan");
var express = require('express');
var bodyParser = require("body-parser"); // Body parser for fetch posted data
var app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));



function REST()
{
    var self = this;
    self.connectMysql();
}

REST.prototype.connectMysql = function()
{
    var self = this;

    var pool = mysql.createPool({
        connectionLimit: 100,
        host     : '127.0.0.1',
        user     : 'root',
        password : '',
        database : 'frcscout2017',
        debug    : false
    });
    /* DEPLOY ONLY

     var pool = mysql.createPool({
        connectionLimit: 100,
        host     : 'us-cdbr-iron-east-02.cleardb.net',
        user     : 'b0300fbf50016c',
        password : '5e2c6588',
        database : 'heroku_334858cdfe17cb4',
        debug    : false
    });
   */
    pool.getConnection(function(err, connection) {
        if(err)
            self.stop(err);
        else
            self.configureExpress(connection);
    });
}

REST.prototype.configureExpress = function(connection)
{
    var self = this;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(morgan("dev"));
    var router = express.Router();
    app.use('/', router);
    var rest_router = new rest(router, connection);
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
