const http = require('http');
const { hostname } = require('os');

const options = {
    hostname : 'localhost',
    port : 3000,
    path : '/',
    method : 'GET'
}

for(let i=0; i<20; i++){

    const req = http.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        res.on('data', (chunk) => {
            console.log(`Response Body from load balancer: ${chunk.toString()}`);
        });

        res.on('end', () => {
            //console.log('No more data in response.');
        });

    });

    req.on('error', (err) => {
        console.log(err.message);;
    });

    req.end();

}
