// Add colors package.  This will allow us to display useful info when setting
// up server.
const colors = require('colors');
// Package for parsing xml.
const xml2js = require('xml2js');
// Models
const models = require('./models');

const YEAR = 0;
const TYPE = 1;
const SORT = 2;
const DEPTID = 3;
const DEPTNAME = 4;
const DIVID = 5;
const DIVNAME = 6;
const FUNDID = 7;
const FUNDNAME = 8;
const ACCTID = 9;
const ACCTNAME = 10;
const TOTAL = 11;

module.exports.filterData = function(data, db) {
  const parser = new xml2js.Parser();

  parser.parseString(data, function(err, result) {

    // Error?  Go ahead and return
    if (err) {
      console.log("Error while parsing data".red);
      return;
    }

    // Otherwise, assign the actual data to a const called rows and filter
    // things out
    const rows = result.dataset.data[0].row;
    console.log("Parsing Successful".green);
    console.log("Filtering Data");

    var depts = [];
    var divisions = [];
    var funds = [];

    for(var i = 0; i < rows.length; i ++) {

      // Check the department info.  If we haven't an identical
      // department yet, then add it.
      filterDept(rows[i].value[DEPTID], rows[i].value[DEPTNAME], depts);

      filterDivision(rows[i].value[DEPTID], rows[i].value[DIVID],
        rows[i].value[DIVNAME], divisions);

      filterFund(rows[i].value[FUNDID], rows[i].value[FUNDNAME], funds);

      rows[i] = cleanAccount(rows[i]);
    }

    // Great, now that it's all filtered, let's start adding this stuff to the
    // db
    // BEHOLD! Node's callback hell problem
    models.Department.bulkCreate(depts).then(function() {
      models.Division.bulkCreate(divisions).then(function() {
        models.Fund.bulkCreate(funds).then(function() {
          models.Account.bulkCreate(rows).then(function() {
            console.log("Data stored".green);
          });
        })
      })
    })

  });
}

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
    if(divArray[i].divisionID === divID) {
      found = true;
      break;
    }
  }

  if (found === false) {
    newDiv = {
      deptID: deptID,
      divisionID: divID,
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

// Cleans up the data associated with accounts by returning back an object with
// the necessary type conversions
const cleanAccount = function(account) {

  return {
    accountID: account.value[ACCTID],
    year: parseInt(account.value[YEAR]),
    budgetType: account.value[TYPE],
    sortOrder: parseInt(account.value[SORT]),
    name: account.value[ACCTNAME],
    total: parseInt(account.value[TOTAL]),
    divisionID: account.value[DIVID],
    fundID: account.value[FUNDID]
  }
}
