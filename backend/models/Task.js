const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id:     { type: DataTypes.INTEGER, allowNull: false },
    title:       { type: DataTypes.STRING,  allowNull: false },
    description: { type: DataTypes.TEXT,    allowNull: false },
    status:      { type: DataTypes.ENUM("Pending", "In Progress", "Completed"), defaultValue: "Pending" },
    created_at:  { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
  },
  { tableName: "tasks", timestamps: false }
);

module.exports = Task;
