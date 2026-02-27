#Reverse Proxy Load Balancer

Large-scale production-grade reverse proxy designed to operate under configurable latency and throughput constraints.

Supports dynamic load balancing strategies, active health monitoring, runtime metrics, and YAML-based configuration validation.

##Overview

This reverse proxy distributes traffic across backend services using pluggable balancing algorithms. It continuously monitors backend health and latency characteristics and adapts routing decisions accordingly.

The system is designed for:

High availability

Latency-aware routing

Throughput control

Observability

Failure isolation

##Features
Load Balancing Algorithms (v0.2.1)

Round Robin

Least Connections

Least EWMA Latency

Least Dynamic Score

score = avgLatency * (currentRequests + 1)

All strategies are selectable via configuration.

##Active Health Polling

Backends are periodically probed via a configurable endpoint:

GET /health

Unhealthy backends are automatically excluded from routing decisions.

Configuration:

healthCheck:
  interval: 1000        # ms
  path: /health
  timeout: 3000
Metrics Endpoint

A snapshot of runtime state is exposed at:

GET /metrics

Returns:

Backend health status

Active connections per backend

Average latency (EWMA)

Dynamic score values

Historical metrics snapshot

##Metrics configuration:

metrics:
  interval: 5000
  historySize: 100
##Dynamic YAML Configuration

The proxy loads configuration at startup from YAML.

Validation includes:

Required field verification

Strategy validation

Numeric bounds checks

Backend definition validation

Failure-fast behavior on invalid config

Example:
Refer to config.example.yaml for more reference.

##Testing
Local Client
node client.js
Load Testing with autocannon
autocannon -c 50 -d 10 "http://localhost:PORT"

Replace PORT with configured gateway port.