# BuzzMall

BuzzMall is a modular, microservices-based backend for e-commerce, built with NestJS, TypeScript, Node.js, and RabbitMQ. It demonstrates scalable, event-driven architecture using modern backend technologies.

## Features

- Microservices for Orders, Payments, Inventory, Notifications, and Users
- Asynchronous communication via RabbitMQ
- Docker setup for easy deployment
- API Gateway for routing
- Example RabbitMQ integration
- Extensible for additional services

## Key Technologies & Concepts

- NestJS (modular Node.js framework)
- RabbitMQ (message broker)
- Microservices Architecture
- CQRS & Event Sourcing
- Docker (containerization)
- Kubernetes (optional, for orchestration)
- Redis (caching, pub/sub)
- MongoDB/PostgreSQL (database)
- API Gateway (service routing)
- gRPC (optional, for service-to-service comms)
- Prometheus & Grafana (monitoring)
- ELK Stack (logging)
- JWT/OAuth2 (security)
- Distributed Tracing (Jaeger/Zipkin)
- Rate Limiting & Circuit Breaker Patterns
- Swagger/OpenAPI (API docs)
- Jest (testing)

## How It Connects

All these technologies work together to create a scalable, resilient, and observable backend. Services communicate via RabbitMQ and optionally gRPC, API Gateway routes requests, databases store data, Redis caches, and monitoring/logging/tracing tools provide visibility. Docker/Kubernetes manage deployment and scaling.

For a deeper understanding, see `ARCHITECTURE.md`.

## Learning Approach

Try to implement each feature yourself using official docs and guides. If you get stuck, ask for hints or links to documentation. Only request direct code or solutions if you truly can't figure it out.

## Getting Started

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Start RabbitMQ (locally or via Docker):

   ```bash
   docker run -d --hostname buzzmall-rabbit --name buzzmall-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

3. Start the development server:

   ```bash
   npm run start:dev
   ```

## Architecture
- Each service is a NestJS app communicating via RabbitMQ
- API Gateway routes requests to appropriate services
- Docker Compose can be used for multi-service orchestration

## Extending
Add new microservices by following the NestJS module pattern and connecting them via RabbitMQ.

## License
MIT
