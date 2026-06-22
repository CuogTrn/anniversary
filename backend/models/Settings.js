/**
 * Model: Settings (Cấu hình chung)
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Settings = sequelize.define(
    "Settings",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        avatar1: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        avatar2: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        loveStartDate: {
            type: DataTypes.DATE,
            defaultValue: new Date("2025-12-22T00:00:00"),
        },
    },
    {
        timestamps: false,
        tableName: "settings",
    },
);

module.exports = Settings;
