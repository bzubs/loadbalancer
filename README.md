# Reverse Proxy Load Balancer

A large-scale production-grade, high-performance reverse proxy designed to operate under configurable latency and throughput constraints. This system provides a pluggable architecture for sophisticated traffic distribution and real-time observability.

## Architecture Overview

The system is built on a modular foundation to ensure high availability and deterministic performance:

* **Request Router:** The entry point that intercepts incoming traffic and dispatches it to the optimal backend.
* **Strategy Engine:** A pluggable module housing load balancing algorithms (Round Robin, EWMA, etc.).
* **Health Monitor:** Performs active polling of backends to ensure traffic is only routed to healthy nodes.
* **Metrics Engine:** Collects runtime statistics and exposes them via a dedicated snapshot endpoint.
* **Configuration Loader:** A strict YAML parser with fail-fast validation to prevent misconfigured deployments.

---

## Features

### Load Balancing Strategies (v0.2.1)
The engine supports multiple algorithms tailored for different traffic patterns:

* **Round Robin:** Simple cyclic distribution.
* **Least Connections:** Routes to the backend with the fewest active requests.
* **Least EWMA Latency:** Uses Exponentially Weighted Moving Average to favor historically fast backends.
* **Least Dynamic Score:** A hybrid approach using the following formula:
    $$score = avgLatency * (currentRequests + 1)$$

### Active Health Polling
Automatically isolates failing services using periodic `GET /health` probes.
* **Configurable Intervals:** Fine-tune polling frequency and timeouts.
* **Dynamic Pool Updates:** Unhealthy nodes are removed and reintroduced without requiring a restart.

### Observability
Access real-time system state via `GET /metrics`. Includes:
* Backend health status and active connection counts.
* EWMA latency calculations.
* Historical metrics buffer for trend analysis.

---

## 🛠 Configuration

The system uses a `config.yaml` file for all operational parameters. Below is a standard production example:

Ex:
Refer to config.example.yaml for full reference.

---

## 📈 Operational Characteristics

| Feature | Description |
| :--- | :--- |
| **I/O Model** | Non-blocking, event-driven I/O. |
| **Failure Handling** | Returns `503 Service Unavailable` if the entire pool is unhealthy. |
| **Validation** | Fail-fast startup; process exits on invalid YAML schema. |
| **Isolation** | Metrics collection is decoupled from the primary request path. |

---

## Testing

### Load Testing
To benchmark the gateway under stress, use `autocannon`:
```bash
autocannon -c 50 -d 10 "http://localhost:8080"
```

---
