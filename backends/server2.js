import http from 'http';

const PORT = 3002;

const server = http.createServer((req, res)=>{

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello from Server 3002');
})

server.listen(PORT, ()=>{
    console.log(`Server 2 is running on port ${PORT}`);
})
