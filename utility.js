import http from 'http';
import fs from 'fs';
import yaml from 'js-yaml';
import { configSchema } from './config.js';


function pollHealth(backends = [], path = '/health') {
    backends.forEach((b) => {
        const pollOpt = {
            hostname: b.host,
            port: b.port,
            path: path,
            method: 'GET'
        }
        const pollStart = Date.now();
        let pollReq = http.request(pollOpt, (res) => {

            if (res.statusCode === 200) {
                let pollLaten = Date.now() - pollStart;
                b.health = 2;

                if (pollLaten > 2 * b.avgLatency) {
                    b.health = 1;
                }
            }
            else {
                b.health = 0;
            }

            res.on('error', () => {
                b.health = 0;
            })
        });

        pollReq.end();

        pollReq.on('error', () => {
            b.health = 0;
        })
    });

}


function genMetrics(backends = [], history = [], historySize = 100) {

    if (history.length >= historySize) {
        history.shift();
    }

    history.push({
        timestamp: Date.now(),
        backendState: backends.map(b => ({
            port: b.port,
            currentRequests: b.currentRequests,
            avgLatency: b.avgLatency.toFixed(3),
            health: b.health
        }))
    });
}

async function loadConfig(path = "./config.yaml") {
    const raw = await fs.readFileSync(path, "utf8");
    const parsed = yaml.load(raw);

    return configSchema.parse(parsed); // throws if invalid
}


export { pollHealth, genMetrics, loadConfig };


