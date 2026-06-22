const dns = require("dns");
const host = "dpg-d8s96o36sc1c73c6hpb0-a";
const candidate = host + ".postgres.render.com";
console.log("Testing candidate host:", candidate);

dns.lookup(candidate, (err, address, family) => {
    if (err) {
        console.error(
            "DNS lookup error for candidate:",
            err.code || err.message,
        );
        process.exit(1);
    }
    console.log("Candidate resolved:", address, "family", family);
});
