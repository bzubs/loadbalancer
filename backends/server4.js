import http from 'http';
import {sleep} from '../helper.js';
const PORT = 3004;

const server = http.createServer((req, res)=>{

    sleep(1000);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello from Server 3004');
})

server.listen(PORT, ()=>{
    console.log(`Server 4 is running on port ${PORT}`);
})
