import http from 'http';

function roundRobin(PORT=3000, backends = [], history =[], index = 0) {

    if(backends.length === 0){
        return null;
    }

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
                backend.latency.push(laten);
                history.push({ timestamp: Date.now(), backend: backend.port, latency: laten, requests: backend.currentRequests });
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
        })


    }
    );

    return balancer;

};

export { roundRobin};