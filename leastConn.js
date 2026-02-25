import http from 'http';


function leastConn(PORT = 3000, backends = [], history = [], index = 0) {

    if (backends.length === 0) {
        return null;
    }

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

        const options = {
            hostname: backend.hostname,
            port: backend.port,
            path: req.path,
            method: req.method,
            headers: req.headers

        }

        const start = Date.now();


        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);


            res.on('finish', () => {
                const laten = Date.now() - start;
            });

            res.on('end', ()=>{
                cleanup()
            });
        })





    })


}