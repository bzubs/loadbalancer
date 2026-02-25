import { roundRobin } from './roundrobin.js';


const PORT = 3000;
const backends = [{
    host: 'localhost', port: 3001, currentRequests: 0, latency: []
},
{
    host: 'localhost', port: 3002, currentRequests: 0, latency: []
}
]



let history = [];
let index = 0;


const balancer = roundRobin(PORT, backends, history, index);


setInterval(() => {
    console.log("---- Metrics ----");
    backends.forEach(b => {
        console.log(
            `Port ${b.port} | Active: ${b.currentRequests} | Avg latency: ${b.latency.length
                ? (b.latency.reduce((a, c) => a + c, 0) / b.latency.length).toFixed(2)
                : 0
            } ms`
        );
    });
}, 5000);

balancer.listen(PORT, () => {
    console.log(`Load balancer is running on port ${PORT}`);
})