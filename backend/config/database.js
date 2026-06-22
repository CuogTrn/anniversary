/**
 * ============================================================
 * CẤU HÌNH DATABASE - SEQUELIZE + PostgreSQL
 * ============================================================
 * File này cấu hình kết nối tới PostgreSQL trên Render
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Tạo instance Sequelize từ DATABASE_URL (Render cung cấp)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    ssl: true, // Render yêu cầu SSL
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Kiểm tra kết nối
sequelize
    .authenticate()
    .then(() => console.log("[DB] ✅ Kết nối PostgreSQL thành công!"))
    .catch((err) =>
        console.error("[DB] ❌ Lỗi kết nối PostgreSQL:", err.message),
    );

module.exports = sequelize;
