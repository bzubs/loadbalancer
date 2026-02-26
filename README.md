Large-scale Production Grade Implementation of a Reverse Proxy that handles load under pre- configured latency and throughput requirements.


Balancing Algorithms available for v0.1.1:
1) Round Robin
2) Least Connections Available
3) Least EMWA Latency (Exponentially Moving Weighted Average of Latency)
4) Least Dynamic Score (Score = avgLatency * (currentRequests + 1))
Testing can be done through running client.js file by 
*node client.js*


or by autocannon using the following command
*autocannon -c 50 -d 10 "http://localhost:port"*

replace port with the in use port 
