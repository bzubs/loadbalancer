import {z} from 'zod';

const configSchema = z.object({
    port: z.number(),
    strategy: z.enum(["leastConn", "roundRobin", "leastLaten", "leastScore"]),
    alpha: z.number().min(0).max(1),
    healthCheck: z.object({
        interval: z.number(),
        path: z.string()
    }),
    metrics: z.object({
        interval: z.number(),
        historySize: z.number()
    }),
    backends: z.array(
        z.object({
            host: z.string(),
            port: z.number()
        })
    )
});

export {configSchema};