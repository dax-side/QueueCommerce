# QueueCommerce

> A production-ready, event-driven microservices e-commerce backend built with modern technologies

QueueCommerce demonstrates enterprise-level microservices architecture with real-time event processing, payment integration, and scalable infrastructure. Built with NestJS, TypeScript, RabbitMQ, and integrated with Stripe for payment processing.

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                      │
│                    (Web, Mobile, Admin Panel)                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                      API GATEWAY (Future)                      │
│            Authentication │ Rate Limiting │ Routing             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┬─────────────────────────┐
    │                 │                 │                         │
┌───▼────┐      ┌─────▼─────┐      ┌────▼─────┐            ┌─────────┐
│ ORDER  │      │  PAYMENT  │      │INVENTORY │            │  USER   │
│SERVICE │      │ SERVICE   │      │ SERVICE  │            │SERVICE  │
│Port:3000│      │Port:3003  │      │Port:3001 │            │(Future) │
└───┬────┘      └─────┬─────┘      └────┬─────┘            └─────────┘
    │                 │                 │                         
    │                 │                 │                         
┌───▼────┐      ┌─────▼─────┐      ┌────▼─────┐            ┌─────────┐
│MongoDB │      │ MongoDB   │      │ MongoDB  │            │NOTIFICATION│
│Orders  │      │ Payments  │      │Inventory │            │ SERVICE │
│   DB   │      │    DB     │      │    DB    │            │(Future) │
└────────┘      └───────────┘      └──────────┘            └─────────┘
                      │                                         
                      │                                         
                ┌─────▼─────┐                                   
                │   STRIPE  │                                   
                │    API    │                                   
                └───────────┘                                   
                                                               
    └─────────────────┬─────────────────────────────────────────┘
                      │
            ┌─────────▼─────────┐
            │    RABBITMQ       │
            │  MESSAGE BROKER   │
            │   Event Bus       │
            └───────────────────┘
```

## ✅ Implemented Features

### Core Services

#### 🔸 Order Service (Production Ready)
- **Port**: 3000
- **Database**: MongoDB Atlas
- **Features**:
  - Complete order lifecycle management
  - Real-time event publishing for downstream services
  - Order status tracking and updates
  - Customer information management
  - Comprehensive validation and error handling
- **API**: RESTful with OpenAPI documentation
- **Events**: Publishes `order.created`, `inventory.reservation.requested`, `payment.process.requested`

#### 🔸 Inventory Service (Production Ready)
- **Port**: 3001
- **Database**: MongoDB Atlas
- **Features**:
  - Real-time product catalog management
  - Advanced inventory reservation system
  - Stock quantity tracking with automatic updates
  - Low stock alerting system
  - Product search and filtering capabilities
- **API**: RESTful with OpenAPI documentation
- **Events**: Consumes inventory requests, publishes reservation confirmations

#### 🔸 Payment Service (Production Ready)
- **Port**: 3003
- **Database**: MongoDB Atlas
- **External Integration**: Stripe Payment Platform
- **Features**:
  - Real Stripe payment intent creation
  - Payment confirmation and refund processing
  - Webhook handling for payment status updates
  - Secure payment data management
  - Multi-currency support (USD default)
- **API**: RESTful with OpenAPI documentation
- **Events**: Consumes payment requests, publishes payment confirmations

### Infrastructure Components

#### 🔸 Event-Driven Architecture
- **Message Broker**: RabbitMQ with Docker deployment
- **Pattern**: Publish-Subscribe with reliable message delivery
- **Reliability**: Durable queues with acknowledgments
- **Scalability**: Horizontal scaling ready

#### 🔸 Database Architecture
- **Strategy**: Database per service pattern
- **Provider**: MongoDB Atlas (Cloud-hosted)
- **Features**: Connection pooling, automatic failover, global distribution
- **Security**: Encrypted connections, authentication

#### 🔸 Payment Integration
- **Provider**: Stripe (Industry-leading payment platform)
- **Mode**: Test environment with real API integration
- **Features**: Payment intents, webhooks, refunds, multi-currency
- **Security**: PCI-compliant, encrypted communication

## 🚧 Implementation Roadmap

### Phase 1: Core Services (Completed)
- ✅ Order Service with event publishing
- ✅ Inventory Service with real-time stock management
- ✅ Payment Service with Stripe integration
- ✅ RabbitMQ event-driven communication
- ✅ MongoDB Atlas integration

### Phase 2: Infrastructure & Security (In Progress)
- 🔄 **API Gateway**
  - Centralized routing and load balancing
  - JWT/OAuth2 authentication
  - Rate limiting and throttling
  - Request/response transformation
  - API versioning

- 🔄 **User Service**
  - User registration and authentication
  - Role-based access control (RBAC)
  - Profile management
  - Session management
  - Password security and recovery

- 🔄 **Notification Service**
  - Email notifications (order confirmations, payment updates)
  - SMS notifications for critical updates
  - Push notifications for mobile apps
  - Template management
  - Delivery tracking and analytics

### Phase 3: Advanced Features
- 🔄 **Redis Integration**
  - Session storage and caching
  - Real-time pub/sub messaging
  - Cache-aside pattern implementation
  - Performance optimization

- 🔄 **CQRS & Event Sourcing**
  - Command Query Responsibility Segregation
  - Event store implementation
  - Read/write model separation
  - Event replay capabilities

- 🔄 **Security Hardening**
  - JWT/OAuth2 authentication
  - Rate limiting per user/IP
  - Circuit breaker patterns
  - Input validation and sanitization
  - HTTPS enforcement

### Phase 4: Observability & Operations
- 🔄 **Monitoring Stack**
  - Prometheus metrics collection
  - Grafana dashboards and alerting
  - Custom business metrics
  - Performance monitoring

- 🔄 **Logging & Tracing**
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Distributed tracing with Jaeger/Zipkin
  - Structured logging across services
  - Error tracking and analytics

- 🔄 **Testing Suite**
  - Jest unit testing framework
  - Integration testing
  - Contract testing between services
  - Load testing and performance benchmarks

### Phase 5: Production Deployment
- 🔄 **Containerization**
  - Docker containers for all services
  - Multi-stage builds for optimization
  - Container security scanning
  - Image registry management

- 🔄 **Orchestration**
  - Kubernetes deployment manifests
  - Helm charts for configuration management
  - Auto-scaling policies
  - Rolling deployments

- 🔄 **DevOps Pipeline**
  - CI/CD with automated testing
  - Infrastructure as Code (IaC)
  - Environment management
  - Automated security scanning

## 🛠️ Technology Stack

### Backend Framework
| Technology | Purpose | Status |
|------------|---------|--------|
| **NestJS** | Node.js framework with dependency injection | ✅ Implemented |
| **TypeScript** | Type-safe JavaScript with modern features | ✅ Implemented |
| **Node.js** | Runtime environment | ✅ Implemented |

### Data & Messaging
| Technology | Purpose | Status |
|------------|---------|--------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database | ✅ Implemented |
| **RabbitMQ** | AMQP message broker | ✅ Implemented |
| **Redis** | In-memory cache and pub/sub | 🔄 Planned |

### External Services
| Technology | Purpose | Status |
|------------|---------|--------|
| **Stripe** | Payment processing platform | ✅ Implemented |
| **SendGrid** | Email delivery service | 🔄 Planned |
| **Twilio** | SMS and communication APIs | 🔄 Planned |

### DevOps & Infrastructure
| Technology | Purpose | Status |
|------------|---------|--------|
| **Docker** | Containerization | ✅ Partial (RabbitMQ) |
| **Kubernetes** | Container orchestration | 🔄 Planned |
| **Prometheus** | Metrics and monitoring | 🔄 Planned |
| **Grafana** | Visualization and dashboards | 🔄 Planned |

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ with npm
- Docker Desktop
- MongoDB Atlas account
- Stripe test account

### Installation & Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/QueueCommerce.git
   cd QueueCommerce
   
   # Install dependencies for all services
   cd services/order-service && npm install
   cd ../inventory-service && npm install  
   cd ../payment-service && npm install
   ```

2. **Infrastructure Setup**
   ```bash
   # Start RabbitMQ with management interface
   docker run -d --hostname queuecommerce-rabbit \
     --name queuecommerce-rabbit \
     -p 5672:5672 -p 15672:15672 \
     rabbitmq:3-management
   
   # Configure RabbitMQ admin user
   docker exec queuecommerce-rabbit rabbitmqctl add_user admin admin123
   docker exec queuecommerce-rabbit rabbitmqctl set_user_tags admin administrator
   docker exec queuecommerce-rabbit rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp services/order-service/.env.example services/order-service/.env
   cp services/inventory-service/.env.example services/inventory-service/.env
   cp services/payment-service/.env.example services/payment-service/.env
   
   # Configure MongoDB Atlas connections
   # Configure Stripe test API keys
   # Configure RabbitMQ connection strings
   ```

4. **Start Services**
   ```bash
   # Terminal 1 - Order Service
   cd services/order-service && npm start
   
   # Terminal 2 - Inventory Service
   cd services/inventory-service && npm start
   
   # Terminal 3 - Payment Service
   cd services/payment-service && npm start
   ```

### Verification & Testing

1. **Health Checks**
   ```bash
   # Verify all services are running
   curl http://localhost:3000  # Order Service
   curl http://localhost:3001  # Inventory Service
   curl http://localhost:3003  # Payment Service
   ```

2. **End-to-End Flow Test**
   ```bash
   # 1. Check available products
   curl http://localhost:3001/products
   
   # 2. Create test order
   curl -X POST http://localhost:3000/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customer": {
         "customerId": "test_customer_001",
         "email": "test@example.com",
         "firstName": "John",
         "lastName": "Doe"
       },
       "items": [{
         "productId": "laptop-001",
         "productName": "Gaming Laptop",
         "quantity": 1,
         "unitPrice": 129999
       }],
       "shippingAddress": {
         "street": "123 Test Street",
         "city": "Test City",
         "state": "TC",
         "postalCode": "12345",
         "country": "USA"
       },
       "paymentMethod": "credit_card"
     }'
   
   # 3. Verify payment was created
   curl http://localhost:3003/payments
   ```

## 📊 API Documentation

### Service Endpoints

| Service | Documentation | Base URL |
|---------|---------------|----------|
| **Order Service** | http://localhost:3000/api | http://localhost:3000 |
| **Inventory Service** | http://localhost:3001/api | http://localhost:3001 |
| **Payment Service** | http://localhost:3003/api/docs | http://localhost:3003 |

### Key API Operations

#### Order Management
- `POST /orders` - Create new order
- `GET /orders` - List orders with pagination
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order status
- `POST /orders/:id/cancel` - Cancel order

#### Inventory Management
- `GET /products` - List products with filtering
- `POST /products` - Add new product
- `GET /products/:id` - Get product details
- `PATCH /products/:id` - Update product
- `GET /inventory/reservations` - View inventory reservations

#### Payment Processing
- `POST /payments` - Create payment intent
- `GET /payments` - List payments
- `POST /payments/:id/confirm` - Confirm payment
- `POST /payments/:id/refund` - Process refund
- `POST /payments/webhook/stripe` - Stripe webhook handler

## 🏢 Production Considerations

### Scalability
- **Horizontal Scaling**: Services designed as stateless containers
- **Database Sharding**: MongoDB Atlas supports automatic sharding
- **Load Balancing**: Ready for load balancer integration
- **Caching Strategy**: Redis integration planned for performance optimization

### Security
- **Data Encryption**: TLS in transit, encrypted at rest
- **API Security**: Rate limiting and authentication planned
- **Payment Security**: PCI-compliant Stripe integration
- **Environment Security**: Secrets management via environment variables

### Monitoring & Observability
- **Health Checks**: Built-in health endpoints
- **Structured Logging**: Comprehensive logging with context
- **Error Tracking**: Detailed error handling and reporting
- **Performance Metrics**: Application-level metrics collection

### Reliability
- **Fault Tolerance**: Circuit breaker patterns planned
- **Message Reliability**: Durable queues with acknowledgments
- **Data Consistency**: Eventual consistency through event sourcing
- **Backup Strategy**: Automated MongoDB Atlas backups

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards and add tests
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- Comprehensive error handling
- Unit and integration tests required
- API documentation updates

### Architecture Principles
- Single Responsibility Principle
- Database per service
- Event-driven communication
- Idempotent operations
- Graceful error handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**QueueCommerce** - Building the future of e-commerce with modern microservices architecture.
