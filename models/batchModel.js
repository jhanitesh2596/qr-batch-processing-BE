import sequelize from "../db";
import { DataTypes } from "sequelize";
const Batch = sequelize.define("Batch", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
