import http from 'http';

function createBalancer(strategy, backends = [], history = [], alpha = 0.2, waitoff = 5000) {

    const balancer = http.createServer((req, res) => {

        if (req.url === '/metrics') {

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(history));
            return;
        }

        let cleaned = false;

        const healthyBackends = backends.filter(b => b.health !== 0);

        if (healthyBackends.length === 0) {
            res.writeHead(503);
            res.end("Service Unavailable");
            return;
        }

        const backend = strategy(healthyBackends);
        
        backend.currentRequests++;


        function cleanup() {
            if (cleaned) return;
            cleaned = true;
            backend.currentRequests--;
        }

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

            proxyRes.on('end', () => {
                const laten = Date.now() - start;

                if (!backend.init) {
                    backend.avgLatency = laten;
                    backend.init = true;
                } else {
                    backend.avgLatency =
                        alpha * laten + (1 - alpha) * backend.avgLatency;
                }

                cleanup();
            });

            proxyRes.on('error', cleanup);
        });

        proxyReq.on('error', (err) => {
            console.error(`Proxy error: ${err.message}`);
            cleanup();
        });

        req.on('aborted', cleanup);
        res.on('close', cleanup);

        // timeout protection
        proxyReq.setTimeout(waitoff, () => {
            proxyReq.destroy();
            cleanup();
        });

        req.pipe(proxyReq);
        proxyReq.on('end', cleanup);
        proxyReq.on('error', (err) => {
            console.error(`Error in proxy request: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            cleanup();
        });


    });

    return balancer;
}

export { createBalancer };