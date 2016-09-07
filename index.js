//map the port, bring up the server
// Ads express to our project
const express = require('express');
//Adds express handlears to our project
const exphbs = require('express-handlebars');
// Adds standard http package to the project, used to get initial city data
// if we don't have it yet.
const http = require('http');
// Adds sequelize, so we can interact with the database
const sequelize = require('sequelize');
// Import models
const models = require('./models');
// Import dataparser
const dataparser = require('./dataparser');

//turn on express tools
const app = express();
//put everything (images,etc) in public
app.use(express.static('public'));

//set the view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Connect to database
const db = new sequelize('citydata', 'root', 'password');

// Define models
// TODO: Add define here
models.define(db);

// Now sync the database, and once you've done so, download the data from the
// city if you haven't already
db.sync().then(function() {

  // Check to see if we've grabbed the data by doing a simple check to see if
  // the departments table has anything
  models.Department.findAll().then(function(depts) {
    if (depts.length === 0) {
      // Grab the data
      console.log("No city data present.  Downloading...")

      // Need to specify options for our http request.  Low-level node stuff
      const options = {
        hostname: "data.cabq.gov",
        port: 80,
        path: "/government/budget/BudgetCYApprovedCABQ-en-us.xml",
        method: "GET"
      }

      const req = http.request(options, function(res) {

        console.log("Got back a " + res.statusCode + " status code".bold);
        var body = "";

        if (res.statusCode >= 200 && res.statusCode < 400) {

          res.setEncoding('utf8');
          res.on('data', function(chunk) {

            body = body + chunk;

          });

          res.on('end', function() {

            console.log("Download Success!".green);
            console.log("Converting data to javascript object...");

            dataparser.filterData(body, db);

          });

        } else {

          console.log("Download Fail!".red);

        }

      });

      req.end();

    }
  });

});

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/dept', function(req, res) {
  res.render('dept');
})

app.get('/deptdata', function (req, res) {

  // Grab all the departments and all the accounts
  models.Department.findAll({
    attributes: ['deptID', 'name', 'total']
  }).then(function(depts) {
    models.BudgetItem.findAll().then(function(items) {

      // For every department, attach a new attribute called total, then
      // calculate the total amount of money allocated to it.
      for(var i = 0; i < depts.length; i ++) {
        depts[i].total = 0;
        for(var j = 0; j < items.length; j ++) {
          if (items[j].divisionID.substring(0, 2) == depts[i].deptID.substring(0, 2)) {
            depts[i].total += items[j].total;
          }
        }
      }
      res.json(depts);
    });
  });
});
  app.get('/about', function (req, res) {
    res.render('about');
  });
  app.get('/contact', function (req, res) {
    res.render('contact');
  });

////
//start the server
const port = 3000;
app.listen(port, function () {
  console.log("Example app listening on port " + port + "!");
});
