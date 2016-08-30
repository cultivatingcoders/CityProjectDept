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
// Add colors package.  This will allow us to display useful info when setting
// up server.
const colors = require('colors');
// Package for parsing xml.
const xml2js = require('xml2js');

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

            // Create parser
            const parser = new xml2js.Parser();
            // Parse data
            parser.parseString(body, function(err, result) {

              if (!err) {
                // We only care about the actual rows of data, getting those is
                // honestly a bit of a pain
                const rows = result.dataset.data[0].row;
                console.log("Parsing Successful".green);

                // Next step is to fitler said data.  Why?  Because we really
                // want to store departments, divisions, and funds as their
                // own tables (makes searching way easier).  Unfortunately,
                // this requires a bit of a process.
                var depts = [];
                var divisions = [];
                var funds = [];
                var found = false;
                var newItem;

                for(var i = 0; i < rows.length; i ++) {

                  // Check the department info.  If we haven't an identical
                  // department yet, then add it.
                  filterDept(rows[i].value[3], rows[i].value[4], depts);

                  filterDivision(rows[i].value[3], rows[i].value[5],
                    rows[i].value[6], divisions);

                  filterFund(rows[i].value[7], rows[i].value[8], funds);
                }
                console.log(funds);
              }

            });

          })

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
  app.get('/dept', function (req, res) {
    res.render('dept');
  });
////
//start the server
const port = 3000;
app.listen(port, function () {
  console.log("Example app listening on port " + port + "!");
});

// Filters through the array for dept info
const filterDept = function(deptID, deptName, deptArray) {

  var found = false;
  var newDept;

  for(var j = 0; j < deptArray.length; j ++) {
    if(deptArray[j].deptID === deptID) {
      found = true;
      break;
    }
  }

  if (found === false) {
    newDept = {
      deptID: deptID,
      name: deptName
    };
    deptArray.push(newDept);
  }

  found = false;
}

// Filters through the array for division info.
const filterDivision = function(deptID, divID, divName, divArray) {

  var found = false;
  var newDiv;

  for(var i = 0; i < divArray.length; i ++) {
    if(divArray[i].divID === divID) {
      found = true;
      break;
    }
  }

  if (found === false) {
    newDiv = {
      deptID: deptID,
      divID: divID,
      name: divName
    }
    divArray.push(newDiv);
  }

  found = false;

}

const filterFund = function(fundID, fundName, fundArray) {

  var found = false;
  var newFund;

  for(var i = 0; i < fundArray.length; i ++) {
    if(fundArray[i].fundID === fundID) {
      found = true;
      break;
    }
  }

  if (found === false) {
    newFund = {
      fundID: fundID,
      name: fundName
    };
    fundArray.push(newFund);
  }

  found = false;
}
