import { leastConn, roundRobin, leastLaten, leastScore } from './algo.js';
import { createBalancer } from './balancer.js';
import { pollHealth, genMetrics, loadConfig } from './utility.js';



console.log('Starting Load Balancer');
console.log('Loading config.yaml...');

let history = [];
let lbConfig;

try {
    lbConfig = await loadConfig();
} catch (err) {
    console.error('Error parsing config.yaml:', err.message);
    process.exit(1);
}

console.log('Config loaded successfully');

const strategies = {
    leastConn,
    roundRobin,
    leastLaten,
    leastScore
};

const strategyFn = strategies[lbConfig.strategy];

if (!strategyFn) {
    console.error(`Invalid strategy: ${lbConfig.strategy}`);
    process.exit(1);
}

const PORT = lbConfig.port;
const backends = lbConfig.backends;

backends.forEach((b)=>{
    b.currentRequests = 0;
    b.init = false;
    b.avgLatency = 0;
    b.health = -1;

});

console.log(`Using strategy: ${lbConfig.strategy}`);

const balancer = createBalancer(strategyFn, backends, history, lbConfig.alpha);

setInterval(
    () => pollHealth(backends, lbConfig.healthCheck.path),
    lbConfig.healthCheck.interval
);

setInterval(
    () => genMetrics(backends, history, lbConfig.metrics.historySize),
    lbConfig.metrics.interval
);

balancer.listen(PORT, () => {
    console.log(`Load balancer running on port ${PORT}`);
});