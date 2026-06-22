/**
 * ============================================================
 * CẤU HÌNH DATABASE - SEQUELIZE + PostgreSQL
 * ============================================================
 * File này cấu hình kết nối tới PostgreSQL trên Render
 */

const path = require("path");
const { Sequelize } = require("sequelize");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

function getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
    if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
        const port = PGPORT || "5432";
        return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${port}/${PGDATABASE}`;
    }

    return null;
}

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
    console.error(
        "[DB] DATABASE_URL is not set.\n" +
            "On Render: Web Service → Environment → add DATABASE_URL\n" +
            "Copy the Internal Database URL from your PostgreSQL service,\n" +
            "or link the database to this web service in the Render dashboard.",
    );
    process.exit(1);
}

// Tạo instance Sequelize từ DATABASE_URL (Render cung cấp)
const sequelize = new Sequelize(databaseUrl, {
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
