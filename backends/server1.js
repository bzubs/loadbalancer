import http from 'http';

const PORT = 3001;

const server = http.createServer((req, res)=>{

    if(req.url==='/health' && req.method=='GET'){
        const obj = {
            alive : true
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(obj));

    }

    if(req.url==='/'){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello from Server 3001');


    }
       

});

server.listen(PORT, ()=>{
    console.log(`Server 1 is running on port ${PORT}`);
});
