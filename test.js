const backends = [{
    host: 'localhost', port: 3001, currentRequests: 8, latency: []
},
{
    host: 'localhost', port: 3002, currentRequests: 5, latency: []
}
]


console.log(backends.reduce((a, b) => {
    return a.currentRequests < b.currentRequests ? a : b;
})
);