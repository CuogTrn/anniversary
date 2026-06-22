const http = require("http");

function req(method, path, data) {
    return new Promise((resolve) => {
        const options = {
            hostname: "localhost",
            port: 3000,
            path,
            method,
            headers: {},
        };
        const r = http.request(options, (res) => {
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () => resolve({ status: res.statusCode, body }));
        });
        r.on("error", (e) => resolve({ error: e.message }));
        if (data) r.write(data);
        r.end();
    });
}

(async () => {
    const tests = [
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

    for (const t of tests) {
        console.log("\n---", t.method, t.path);
        const res = await req(t.method, t.path, t.data);
        console.log(
            res.error
                ? "ERROR: " + res.error
                : "Status: " + res.status + "\n" + res.body,
        );
    }
})();
