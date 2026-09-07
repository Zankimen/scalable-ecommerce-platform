# Scalable E-Commerce Platform

Platform e-commerce edukasional berbasis microservices.

## Menjalankan infrastruktur lokal

```bash
docker compose up -d
```

Service yang tersedia:

- PostgreSQL: `localhost:5433` (container port tetap `5432`)
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ Management UI: <http://localhost:15672> (`ecommerce` / `ecommerce`)
- Mailpit UI: <http://localhost:8025>

## Menjalankan user service

```bash
npm install
npm run dev:user
```

Health check: <http://localhost:3001/health>
