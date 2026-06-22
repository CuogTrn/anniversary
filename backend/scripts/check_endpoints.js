const http = require("http");
const https = require("https");

function request(options, data) {
    return new Promise((resolve) => {
        const lib = options.protocol === "https:" ? https : http;
        const req = lib.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => resolve({ status: res.statusCode, body }));
        });
        req.on("error", (err) => resolve({ error: err.message }));
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    const host = "localhost";
    const port = 3000;
    const endpoints = [
        { method: "GET", path: "/api/bucketlist" },
        { method: "GET", path: "/api/memories" },
        { method: "GET", path: "/api/timecapsule" },
        { method: "GET", path: "/api/settings" },
        {
            method: "POST",
            path: "/api/auth/login",
            data: JSON.stringify({ password: "ourlove2025" }),
            headers: { "Content-Type": "application/json" },
        },
    ];

    for (const ep of endpoints) {
        const options = {
            hostname: host,
            port,
            path: ep.path,
            method: ep.method,
            headers: ep.headers || {},
            protocol: "http:",
        };

        console.log("\n--- " + ep.method + " " + ep.path);
        const res = await request(options, ep.data);
        console.log(
            res.error
                ? "ERROR: " + res.error
                : "Status: " + res.status + "\n" + res.body,
        );
    }
})();
