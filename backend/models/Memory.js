/**
 * Model: Memory (Kỷ niệm)
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Memory = sequelize.define(
    "Memory",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        imageUrl: {
            type: DataTypes.STRING, // Lưu link Cloudinary
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: "memories",
    },
);

module.exports = Memory;
