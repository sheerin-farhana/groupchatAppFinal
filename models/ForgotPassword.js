const Sequelize = require("sequelize");
const sequelize = require("../Utils/database");

const ForgotPassword = sequelize.define("forgotpassword", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  active: {
    type: Sequelize.BOOLEAN,
  },
  expiresby: Sequelize.DATE,
});

module.exports = { ForgotPassword };
