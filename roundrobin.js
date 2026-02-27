import http from 'http';

function roundRobin(backends = [], index = 0, alpha=0.2) {

    if(backends.length === 0){
        return null;
    }

    backends = backends.filter(b => b.health !== 0);


    const balancer = http.createServer((req, res) => {

        let cleaned = false;
        const backend = backends[index];
        index = (index + 1) % backends.length;

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
            proxyRes.pipe(res, { end: true });

            res.on('finish', () => {
                const laten = Date.now() - start;
                //console.log(`${req.method} ${req.url} → ${backend.port} | ${laten}ms`);
                backend.avgLatency = alpha*laten + (1-alpha)*avgLatency;
                cleanup();
            });
            res.on('close', cleanup);
            res.on('error', (err) => {
                console.error(`Error in response: ${err.message}`);
                cleanup();
            });

        })



        req.pipe(proxyReq, { end: true });
        backend.currentRequests++;
        proxyReq.on('error', (err) => {
            console.error(`Error in proxy request: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            cleanup();
        });


    });

    return balancer;

};

export {roundRobin};