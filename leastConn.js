import http from 'http';


function leastConn(backends = [], alpha=0.2) {

    if (backends.length === 0) {
        return null;
    }

    backends = backends.filter(b => b.health !== 0);


    const balancer = http.createServer((req, res) => {

        const backend = backends.reduce((a, b) => {
            return a.currentRequests < b.currentRequests ? a : b;
        })

        let cleaned = false;

        function cleanup() {
            if (cleaned) return;
            cleaned = true;
            backend.currentRequests--;
        }

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
                backend.avgLatency = alpha*laten + (1-alpha)*avgLatency;
                cleanup();
            });

            res.on('close', ()=>{
                cleanup()
            });
            res.on('error', (err)=>{
                console.error(`Error in response: ${err.message}`);
                cleanup();
            });
        })


        req.pipe(proxyReq);
        proxyReq.on('error', (err) => {
            console.error(`Error in proxy request: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            cleanup();
        });

        });
        
        return balancer;
};


export {leastConn};