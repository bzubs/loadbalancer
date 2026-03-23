import http from 'http';

function createBalancer(strategy, backends = [], history = [], alpha = 0.2, waitoff = 5000) {

    const balancer = http.createServer((req, res) => {

        if (req.url === '/metrics') {

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(history));
            return;
        }

        let cleaned = false;
        let failed = false;

        const healthyBackends = backends.filter(b => {

            if (b.health === 0) return false;

            if (b.health === 1) {
                if (b.currentRequests > 0) return false;
                return true; // allow one probe
            }

            return true; // health === 2
        });

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

        function markFailure() {
            if (failed) return;
            failed = true;
            backend.failures++;
            backend.consecutiveFails++;
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

                if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 400) {
                    backend.success++;
                    if (backend.health === 1) {
                        backend.health = 2; // recovered
                    }
                    backend.consecutiveFails = 0;
                } else {
                    
                    if (backend.health === 1) {
                        backend.health = 0;
                        backend.lastFailureTime = Date.now();
                    }
                    markFailure();
                }


                cleanup();
            });

            proxyRes.on('error', markFailure, cleanup);
        });

      
        req.on('aborted', cleanup);
        res.on('close', cleanup);

        // timeout protection
        proxyReq.setTimeout(waitoff, () => {
            proxyReq.destroy();
            markFailure();
            cleanup();
        });

        req.pipe(proxyReq);
        proxyReq.on('end', cleanup);
        proxyReq.on('error', (err) => {
            console.error(`Error in proxy request: ${err.message}`);
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Bad Gateway');

            markFailure();
            cleanup();
        });


    });

    return balancer;
}

export { createBalancer };