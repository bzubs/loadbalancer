import http from 'http';

const PORT = 3003;

const server = http.createServer((req, res) => {

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from Server 3003');
})

server.listen(PORT, () => {
    console.log(`Server 3 is running on port ${PORT}`);
})
