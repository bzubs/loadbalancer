import http from 'http';

function leastScore(backends = [], alpha) {
    if (backends.length == 0) {
        return null;
    }

    for (let i = 0; i < backends.length; i++) {

        backends[i].score = backends[i].avgLatency * (backends[i].currentRequests + 1);

    }

    const balancer = http.createServer((req, res) => {

        const backend = backends.reduce((a, b) => {
            const scoreA = a.avgLatency * (a.currentRequests + 1);
            const scoreB = b.avgLatency * (b.currentRequests + 1);
            return scoreA < scoreB ? a : b;
        });

        let cleaned = false;

        function cleanup() {
            if (cleaned) return;
            cleaned = true;
            backend.currentRequests--;
        };

        backend.currentRequests++;

        const options = {
            hostname: backend.host,
            port: backend.port,
            path: req.url,
            method: req.method,
            headers: req.headers
        }


        const start = Date.now();

        const proxyReq = http.request(options, (proxyRes) => {

            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);

            res.on('finish', () => {
                const laten = Date.now() - start;
                if (!backend.init) {
                    backend.avgLatency = laten;
                    backend.init = true;
                }
                else {
                    backend.avgLatency = alpha * laten + (1 - alpha) * backend.avgLatency;
                }

                cleanup();
            });
            res.on('close', cleanup);

            res.on('error', (err) => {
                console.error(`Error in response: ${err.message}`);
                cleanup();
            });

        });

        req.pipe(proxyReq);
        proxyReq.on('error', (err) => {
            console.error(`Error in proxy request: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            cleanup();
        });

    });
    return balancer;
}

export { leastScore };