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
    name: sequelize.STRING
  });

  module.exports.BudgetItem = db.define('budgetitem', {
    year: sequelize.INTEGER,
    budgetType: sequelize.STRING,
    sortOrder: sequelize.INTEGER,
    name: sequelize.STRING,
    total: sequelize.INTEGER,
    accountID: {
      type: sequelize.STRING,
      references: {
        model: module.exports.Account,
        key: 'accountID'
      }
    },
    divisionID: {
      type: sequelize.STRING,
      references: {
        model: module.exports.Division,
        key: 'divisionID'
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
