/**
 * Model: BucketItem (Danh sách mong ước)
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BucketItem = sequelize.define(
    "BucketItem",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        task: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: false,
        tableName: "bucket_items",
    },
);

module.exports = BucketItem;
