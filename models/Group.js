const Sequelize = require("sequelize");
const sequelize = require("../Utils/database");

const Group = sequelize.define("Groups", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// group_membership.model.js
const GroupMembership = sequelize.define("GroupMemberships", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

module.exports = { Group, GroupMembership };
