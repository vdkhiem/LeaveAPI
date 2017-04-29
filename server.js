// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var Bear       = require('./app/models/bear');
var mongoose   = require('mongoose');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var mongo      = require('mongodb');


mongoose.connect('mongodb://vdkhiem:!Vdk541981@ds123361.mlab.com:23361/dkvo'); // connect to our database
// Connection URL
var url = 'mongodb://localhost:27017/myproject';

var insertBear = function(db, userName, callback) {
    // Get the documents collection
    var collection = db.collection('bear');
    // Insert some documents
    collection.insertOne({name : userName
        }, function(err, result) {
            console.log(`Inserted successful! ${result}`);
            callback(result);
    });
}

var findBears = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('bear');
    // Insert some documents
    collection.find({}).toArray(function(err, result) {
        console.log(`Get all bears successful!`);
        callback(result);
    });
}

var findBearById = function(bear_id, db, callback) {
    // Get the documents collection
    var collection = db.collection('bear');
    // Insert some documents
    collection.find({'_id': mongo.ObjectId(bear_id)}).toArray(function(err, result) {
        if (err) {
            console.log(err);
        }
        console.log(`Get a bear successful!`);
        callback(result);
    });
}

var updateBear = function(bear, db, callback) {
    // Get the documents collection
    var collection = db.collection('bear');
    // Insert some documents
    collection.updateOne({'_id': mongo.ObjectId(bear._id)},
                    {$set: {'name': bear.name}}, function(err, result) {
        if (err) {
            console.log(err);
        }
        console.log(`Update a bear successful!`);
        callback(result);
    });
}



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
// every request need to go through it
router.use(function(req, res, next) {
    // do logging
    console.log('Log every request');
    next(); // Ensure go to next router
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// create a bear (accessed at POST http://localhost:8080/api/bears)
router.route('/bears').post(function(req, res){
    var bear = new Bear();
    bear.name = req.body.name;

    console.log(`Creating a bear ${req.body.name}`);
    
    const userName = bear.name;

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertBear(db, userName, function(result) {
            res.json({message: 'Bear created'});
            db.close();
        });
    });
}).get(function(req, res) { // get all the bears (accessed at GET http://localhost:8080/api/bears)
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findBears(db, function(result) {
            res.json(result);
            db.close();
        });
    });
});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
// get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
router.route('/bears/:bear_id').get(function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findBearById(req.params.bear_id, db, function(result) {
            res.json(result);
            db.close();
        });
    });
}).put(function(req, res) {
    var bear = new Bear();
    bear._id = req.params.bear_id;
    bear.name = req.body.name;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        updateBear(bear, db, function(result) {
            res.json({message: 'Bear Updated Successful!'});
            db.close();
        });
    });
});






// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
