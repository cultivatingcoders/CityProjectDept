/**
 * The business of defining models for our database takes place here.
 * * * * */
const sequelize = require('sequelize');

module.exports.define = function(db) {

  module.exports.Department = db.define('department', {
    deptID: {
      type: sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: sequelize.STRING
  });

  module.exports.Division = db.define('division', {
    divisionID: {
      type: sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: sequelize.STRING,
    deptID: {
      type: sequelize.STRING,
      references: {
        model: module.exports.Department,
        key: 'deptID'
      }
    }
  });

  module.exports.Fund = db.define('fund', {
    fundID: {
      type: sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: sequelize.STRING
  });

  module.exports.Account = db.define('account', {
    accountID: {
      type: sequelize.STRING,
      unique: true,
      allowNull: false
    },
    year: sequelize.INTEGER,
    budgetType: sequelize.STRING,
    sortOrder: sequelize.INTEGER,
    name: sequelize.STRING,
    total: sequelize.INTEGER,
    divisionID: {
      type: sequelize.STRING,
      references: {
        model: module.exports.Division,
        key: 'deptID'
      }
    },
    fundID: {
      type: sequelize.STRING,
      references: {
        model: module.exports.Fund,
        key: 'fundID'
      }
    }
  });
}
