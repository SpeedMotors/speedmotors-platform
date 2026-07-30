# SpeedMotors Automobiles Management Platform

> Cloud-based Sales, Service & Spare Parts Management Platform powered by microservices architecture, modern web technologies, and enterprise-grade DevOps automation pipelines.

---

## 1. Executive Summary & Problem Statement

SpeedMotors Automobiles is a comprehensive digital transformation platform designed to streamline end-to-end dealership operations, repair service workflows, spare parts inventory control, and customer engagement.

### Core Objectives
- **Boost Sales Efficiency**: Automated lead tracking, test drive scheduling, and financing options.
- **Streamline Repair Services**: Digital job card creation, technician assignment, and live repair progress tracking.
- **Optimize Spare Parts & Inventory**: Real-time stock monitoring, automated reorder alerts, and part allocation tracking.
- **Elevate Customer Experience**: Online service bookings, instant status notifications, and customer feedback ratings.
- **Data-Driven Decision Making**: Live analytics dashboards and demand forecasting.

---

## 2. System Architecture

### Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend API** | Node.js (ESM), Express.js, Prisma ORM v6, JWT Authentication, bcrypt |
| **Database** | PostgreSQL 16 Alpine with Prisma Client migration engine |
| **Proxy / Web Server**| Nginx Alpine (Gzip compression, SPA fallback routing, API proxy) |
| **Containerization** | Docker, Multi-stage Dockerfiles, Docker Compose |
| **DevOps & Cloud Target** | Jenkins, Kubernetes (k3s), Terraform, Prometheus, Grafana, ELK Stack |

---

## 3. Deployment via Docker Compose

### Prerequisites
- Docker Desktop (v20.10+) with Docker Compose (`v2.0+`) installed.

### Step 1: Build & Launch Services
Execute the following commands to initialize and run the container stack:

```bash
# Clone repository
git clone https://github.com/your-org/speedmotors-platform.git
cd speedmotors-platform

# Build container images
docker compose build

# Launch services in background
docker compose up -d
```

### Step 2: Service Verification
Verify the status of all active containers:

```bash
docker compose ps
```

Expected Status Output:
```text
NAME                   IMAGE                           STATUS                    PORTS
speedmotors-postgres   postgres:16-alpine              Up (healthy)              0.0.0.0:5432->5432/tcp
speedmotors-backend    speedmotors-platform-backend    Up                        0.0.0.0:5001->5000/tcp
speedmotors-frontend   speedmotors-platform-frontend   Up                        0.0.0.0:80->80/tcp
```

### Access URLs
- **Frontend Web Application**: http://localhost
- **Backend Health Check Endpoint**: http://localhost:5001/health
- **Proxied API Endpoint**: http://localhost/api/cars

### Step 3: Stopping Services
```bash
docker compose down
```

---
