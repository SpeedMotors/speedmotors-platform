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

```
                                  +-------------------------------------------------+
                                  |                 Client Browser                  |
                                  +-------------------------------------------------+
                                                           |
                                                           v
                                  +-------------------------------------------------+
                                  |         Nginx Reverse Proxy / Load Balancer     |
                                  |                     (Port 80)                   |
                                  +-------------------------------------------------+
                                       /                                    \
                        Static Assets /                                      \ API Traffic (/api/*)
                                     v                                        v
  +---------------------------------------------------+    +---------------------------------------------------+
  |           Frontend Service (React 19 + Vite)      |    |        Backend Service (Node.js + Express)       |
  |                Production Build Assets            |    |                     (Port 5000)                   |
  +---------------------------------------------------+    +---------------------------------------------------+
                                                                                     |
                                                                                     v (Prisma ORM)
                                                           +---------------------------------------------------+
                                                           |          PostgreSQL Database (v16 Alpine)        |
                                                           |                     (Port 5432)                   |
                                                           +---------------------------------------------------+
```

### Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend API** | Node.js (ESM), Express.js, Prisma ORM v6, JWT Authentication, bcrypt |
| **Database** | PostgreSQL 16 Alpine with Prisma Client migration engine |
| **Proxy / Web Server**| Nginx Alpine (Gzip compression, SPA fallback routing, API proxy) |
| **Containerization** | Docker, Multi-stage Dockerfiles, Docker Compose |
| **DevOps & Cloud Target** | GitHub Actions / Jenkins, Kubernetes (AWS EKS), Terraform, Prometheus, Grafana, ELK Stack |

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

## 4. Local Development Setup (Non-Containerized)

### Prerequisites
- **Node.js**: v20.19+ or v22+
- **PostgreSQL**: Local instance running on port `5432`

### Backend API Setup
```bash
cd backend

# Install dependencies
npm install

# Apply database migrations & seed initial data
npx prisma db push
node prisma/seed.js

# Start backend development server
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite frontend development server
npm run dev
```

---

## 5. Default Seed Accounts & Authorization Roles

Initial seed data creates demo accounts for system verification:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `demo@admin.com` | `password123` | Full Administrative & System Management |
| **Sales Representative** | `demo@sales.com` | `password123` | Lead Tracking, Test Drive & Quotation Management |
| **Technician** | `demo@technician.com` | `password123` | Job Card Updates, Parts Allocation & Progress Tracking |
| **Customer** | `demo@customer.com` | `password123` | Service Booking, Live Repair Tracking & Reviews |

---

## 6. REST API Specification

| HTTP Method | Endpoint Path | Functional Overview | Authorization |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | User account registration | Public |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT | Public |
| `GET` | `/api/cars` | Retrieve inventory car listings | Public |
| `GET` | `/api/leads` | List sales inquiries and lead statuses | Sales / Admin |
| `POST` | `/api/test-drives` | Schedule vehicle test drives | Authenticated |
| `GET` | `/api/service-bookings` | Fetch customer service bookings | Authenticated |
| `POST` | `/api/job-cards` | Create digital job card for vehicle repair | Tech / Admin |
| `GET` | `/api/inventory` | Query spare parts inventory and stock alerts | Tech / Admin |

---

## 7. DevOps Integration Roadmap

The application architecture aligns with standard DevOps automation stages:

```
+----------------+      +----------------+      +----------------+      +----------------+
|  Source Control | ---> |   CI/CD Build  | ---> | Container Reg. | ---> | Orchestration  |
|  GitHub/GitLab  |      | Jenkins/Actions|      |    AWS ECR     |      |    AWS EKS     |
+----------------+      +----------------+      +----------------+      +----------------+
                                                                                |
                                                                                v
                                                                        +----------------+
                                                                        | Monitoring/Logs|
                                                                        |Prometheus/Graf.|
                                                                        +----------------+
```

### Pipeline Stage Description

1. **Source Control Management**: Feature-branch workflow targeting GitHub / GitLab repositories.
2. **Continuous Integration & Delivery**: Jenkins / GitHub Actions pipelines for automated linting (`oxlint`), testing, multi-stage Docker compilation, and image tagging.
3. **Infrastructure as Code (IaC)**: Terraform scripts for provisioning AWS EKS clusters, VPC networks, and managed AWS RDS PostgreSQL instances.
4. **Container Orchestration**: Kubernetes Deployment, Service, ConfigMap, and Ingress manifests supporting rolling deployments and auto-scaling.
5. **Quality & Security Assurance**: Automated SonarQube static code analysis and OWASP ZAP security testing.
6. **Observability & Operations**: Prometheus and Grafana dashboards for cluster metrics with centralized ELK stack logging.

---

## 8. Directory Layout

```text
speedmotors-platform/
├── backend/                  # Express.js REST API Server
│   ├── prisma/               # Database schema & seed scripts
│   ├── src/                  # Controllers, routes, and services
│   ├── Dockerfile            # Production Node.js Alpine container file
│   ├── .dockerignore         # Docker context exclusion list
│   └── package.json          # Dependency specifications
├── frontend/                 # React 19 + Vite Single Page Application
│   ├── public/               # Static web assets
│   ├── src/                  # UI components, pages, and application state
│   ├── nginx.conf            # Nginx SPA fallback and proxy configuration
│   ├── Dockerfile            # Multi-stage Nginx container build file
│   └── package.json          # Package dependencies
├── docker-compose.yml        # Container orchestration manifest
├── README.md                 # Technical platform documentation
└── .dockerignore             # Root docker build context exclusion list
```

---

## 9. License

Copyright © SpeedMotors Automobiles. All rights reserved.
