const fs = require("fs");
const dns = require("dns");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
    console.error(".env not found at", envPath);
    process.exit(1);
}
const env = fs.readFileSync(envPath, "utf8");
const m = env.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
if (!m) {
    console.error("DATABASE_URL not set in .env");
    process.exit(2);
}
const dbUrl = m[1].trim();
console.log("DATABASE_URL=", dbUrl);

// extract host (between @ and : or /)
let host = null;
try {
    const url = new URL(dbUrl);
    host = url.hostname;
} catch (e) {
    // fallback parse
    const mm = dbUrl.match(/^postgresql:\/\/[^@]+@([^:\/]+)([:\/]|$)/);
    host = mm ? mm[1] : null;
}
if (!host) {
    console.error("Could not extract host from DATABASE_URL");
    process.exit(3);
}
console.log("Resolved host:", host);

console.log("Running dns.lookup...");
dns.lookup(host, (err, address, family) => {
    if (err) {
        console.error("DNS lookup error:", err.code || err.message);
        process.exit(4);
    }
    console.log("Address:", address, "Family:", family);
});
