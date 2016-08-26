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
// Create a department model
const Department = db.define('deptartment', {
  deptID: sequelize.INTEGER,
  name: sequelize.STRING
});

// Create a division model
const Division = db.define('division', {
  divisionID: sequelize.INTEGER,
  name: sequelize.STRING,
  deptID: {
    type: sequelize.INTEGER,
    references: {
      model: Department,
      id: 'deptID'
    }
  }
});

// Create a fund model
const Fund = db.define('fund', {
  fundID: sequelize.INTEGER,
  name: sequelize.STRING
});

// Create a model for accounts
const Account = db.define('account', {
  accountID: sequelize.INTEGER,
  year: sequelize.INTEGER,
  budgetType: sequelize.STRING,
  sortOrder: sequelize.INTEGER,
  name: sequelize.STRING,
  total: sequelize.INTEGER,
  divisionID: {
    type: sequelize.INTEGER,
    references: {
      model: Division,
      id: 'deptID'
    }
  },
  fundID: {
    type: sequelize.INTEGER,
    references: {
      model: Fund,
      id: 'fundID'
    }
  }
});

// Now sync the database, and once you've done so, download the data from the
// city if you haven't already
db.sync().then(function() {

  // Check to see if we've grabbed the data by doing a simple check to see if
  // the departments table has anything
  Department.findAll().then(function(depts) {
    if (depts.length === 0) {
      // Grab the data
      console.log("No city data present.  Downloading...")
    }
  });

});

app.get('/', function (req, res) {
  res.render('home');
});
  app.get('/dept', function (req, res) {
    res.render('dept');
  });
////
//start the server
const port = 3000;
app.listen(port, function () {
  console.log("Example app listening on port " + port + "!");
});
