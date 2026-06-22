/**
 * Model: TimeCapsule (Hộp thư hẹn giờ)
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeCapsule = sequelize.define(
    "TimeCapsule",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        unlockDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: "time_capsules",
    },
);

module.exports = TimeCapsule;
