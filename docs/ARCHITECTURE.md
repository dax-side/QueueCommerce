# BuzzMall Architecture
  
Below is a text-based sketch of the BuzzMall architecture, showing how all major components and buzzword technologies connect:

```text
                                [User]
                                  |
                            [API Gateway]
                      (JWT/OAuth2, Rate Limiting, 
                       Swagger/OpenAPI, Routing)
                                  |
        ┌─────────────────────────┼─────────────────────────┐
        |                        |                         |
    [Order]                 [Payment]                [Inventory]
     Svc                      Svc                       Svc
        |                        |                         |
        |                        |                         |
    [Notification]           [User Svc]               [NestJS + CQRS]
       Svc                      |                    [Event Sourcing]
        |                       |                      [Jest]
        └───────────────────────┼───────────────────────┘
                                |
                         [RabbitMQ - Message Broker]
                         (Async Event Communication)
                                |
                ┌───────────────┼───────────────┐
                |               |               |
        [MongoDB/PostgreSQL]  [Redis]     [gRPC - Optional]
         (Per Service DB)    (Cache +      (Sync Service
                            Pub/Sub)       Communication)
                                |
        ┌───────────────────────┼───────────────────────┐
        |                      |                       |
   [Prometheus/         [ELK Stack]              [Jaeger/Zipkin]
    Grafana]            (Logging)               (Distributed Tracing)
   (Monitoring)
        |                      |                       |
        └──────────────────────┼───────────────────────┘
                               |
                    [Docker/Kubernetes]
                  (Containerization/Orchestration)
```

BuzzMall is designed as a modular, distributed microservices backend for e-commerce, integrating a wide range of modern backend technologies. This guide will help you understand how each component fits together and how to explore or extend the system.


## System Architecture Overview

BuzzMall is built as a modular, distributed microservices backend. Here's how the main components interact:

1. **User**: Interacts with the system via web or mobile app.

2. **API Gateway**: The single entry point for all requests. Handles routing, authentication (JWT/OAuth2), rate limiting, and API documentation (Swagger/OpenAPI).

3. **Microservices**: Each domain (Order, Payment, Inventory, Notification, User) is a separate NestJS service. Services use CQRS/Event Sourcing for advanced data handling and are independently deployable.

4. **RabbitMQ**: All microservices communicate asynchronously using RabbitMQ as the message broker. This enables event-driven workflows and decouples services.

5. **Databases**: Each microservice has its own database (MongoDB or PostgreSQL) for persistent storage. This ensures data isolation and scalability.

6. **Redis**: Used for caching and pub/sub to speed up data access and enable real-time features.

7. **Monitoring & Logging**: Prometheus and Grafana collect metrics for observability. ELK Stack (Elasticsearch, Logstash, Kibana) centralizes logs for troubleshooting and analysis.

8. **Security & Tracing**: JWT/OAuth2 secures APIs. Jaeger/Zipkin provide distributed tracing to follow requests across services.

9. **Docker/Kubernetes**: All components are containerized with Docker and can be orchestrated with Kubernetes for scaling, resilience, and easy deployment.

10. **gRPC (optional)**: For high-performance, synchronous service-to-service communication, gRPC can be used alongside RabbitMQ.

11. **Rate Limiting & Circuit Breaker**: Protects services from overload and improves resilience.

12. **Testing**: Jest is used for unit and integration testing of all services.

**Main Flow:**

- User → API Gateway → Microservices
- Microservices ↔ RabbitMQ (async events)
- Microservices → Databases & Redis
- Monitoring, logging, and tracing tools connect to all services
- Docker/Kubernetes orchestrate everything

This architecture supports scalability, reliability, and extensibility for real-world distributed systems.

## Key Technologies & Concepts

- **NestJS:** Modular Node.js framework for building scalable server-side applications.
- **RabbitMQ:** Message broker for asynchronous communication between services.
- **Microservices Architecture:** Each domain (orders, payments, etc.) is a separate service.
- **CQRS & Event Sourcing:** Separate read/write models and store state as events.
- **Docker:** Containerization for easy deployment and scaling.
- **Kubernetes (optional):** Orchestrate containers for high availability and scaling.
- **Redis:** Caching and pub/sub for fast data access and messaging.
- **MongoDB/PostgreSQL:** Database options for persistent storage.
- **API Gateway:** Central entry point for routing requests to services.
- **gRPC (optional):** High-performance service-to-service communication.
- **Prometheus & Grafana:** Monitoring and metrics visualization.
- **ELK Stack:** Centralized logging and search.
- **JWT/OAuth2:** Secure authentication and authorization.
- **Distributed Tracing (Jaeger/Zipkin):** Track requests across services.
- **Rate Limiting & Circuit Breaker:** Resilience and protection against overload.
- **Swagger/OpenAPI:** API documentation and exploration.
- **Jest:** Unit and integration testing.

## How It Connects

- Services communicate via RabbitMQ (async) and optionally gRPC (sync).
- API Gateway routes external requests to the right service.
- Databases store persistent data; Redis caches hot data.
- Monitoring, logging, and tracing tools provide observability.
- Docker/Kubernetes manage deployment and scaling.

## How to Explore & Extend

- Start with one service (e.g., Orders) and follow the NestJS module pattern.
- Integrate RabbitMQ for messaging between services.
- Add CQRS/Event Sourcing for advanced data handling.
- Use Docker Compose for local multi-service orchestration.
- Add monitoring/logging/tracing as you scale.

## Guidance

- Try to implement each feature yourself using official docs and guides.
- If you get stuck, ask for hints or links to documentation.
- Only request direct code or solutions if you truly can't figure it out.

## Documentation Links

- [NestJS Docs](https://docs.nestjs.com/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [CQRS/Event Sourcing](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs/)
- [Docker Docs](https://docs.docker.com/)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Redis Docs](https://redis.io/docs/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [API Gateway Concepts](https://docs.nestjs.com/recipes/api-gateway)
- [gRPC Docs](https://grpc.io/docs/)
- [Prometheus Docs](https://prometheus.io/docs/introduction/overview/)
- [Grafana Docs](https://grafana.com/docs/)
- [ELK Stack](https://www.elastic.co/what-is/elk-stack)
- [JWT](https://jwt.io/introduction/)
- [OAuth2](https://oauth.net/2/)
- [Jaeger](https://www.jaegertracing.io/docs/)
- [Zipkin](https://zipkin.io/)
- [Rate Limiting](https://docs.nestjs.com/techniques/rate-limiting)
- [Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Swagger/OpenAPI](https://swagger.io/docs/)
- [Jest](https://jestjs.io/docs/getting-started)