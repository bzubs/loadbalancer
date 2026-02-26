import http from 'http';


function leastLaten(backends=[]){

    if(backends.length==0){
        return null;
    }

    const balancer = http.createServer((req, res)=>{
        const backend = backends.reduce((a, b) => {
            return a.avgLatency < b.avgLatency ? a : b;
        });


        let cleaned = false;
        function cleanup() {
            if(cleaned) return;
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
        backend.currentRequests++;


        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);


            res.on('finish', () => {
                const laten = Date.now() - start;
                backend.avgLatency = 0.2 * laten + 0.8 * backend.avgLatency;
                cleanup();
            });

            res.on('close', ()=>{
                cleanup()
            });
            res.on('error', (err)=>{
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

};

export {leastLaten};