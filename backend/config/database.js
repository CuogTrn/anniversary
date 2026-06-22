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

function getSslConfig(databaseUrl) {
    if (process.env.DATABASE_SSL === "false") {
        return {};
    }

    if (process.env.DATABASE_SSL === "true") {
        return {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        };
    }

    try {
        const normalized = databaseUrl.replace(
            /^postgresql:\/\//,
            "postgres://",
        );
        const hostname = new URL(normalized).hostname;
        const isLocal =
            hostname === "localhost" || hostname === "127.0.0.1";

        if (isLocal) {
            return {};
        }

        // Render internal URL: dpg-xxx-a (no dot). External URL: dpg-xxx-a.region-postgres.render.com
        const needsSsl =
            hostname.includes(".") ||
            /sslmode=require/i.test(databaseUrl);

        if (needsSsl) {
            return {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            };
        }
    } catch (_) {
        // Fall through to no SSL
    }

    return {};
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

const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: getSslConfig(databaseUrl),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
});

/**
 * Kết nối PostgreSQL với retry (Render cold start / DB chưa sẵn sàng)
 */
async function ensureConnected(maxAttempts = 5, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await sequelize.authenticate();
            console.log("[DB] ✅ Kết nối PostgreSQL thành công!");
            return;
        } catch (err) {
            console.error(
                `[DB] Kết nối thất bại (${attempt}/${maxAttempts}): ${err.message}`,
            );
            if (attempt === maxAttempts) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

module.exports = sequelize;
module.exports.ensureConnected = ensureConnected;
