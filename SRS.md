# Software Requirements Specification (SRS)
## Jobby Employer Platform

**Version**: 1.0.0  
**Date**: May 2026  
**Repository**: [pram47/Devops_CICD](https://github.com/pram47/Devops_CICD)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **Jobby Employer Platform** — a web application that enables companies to manage job postings, monitor candidate applications, scout talent, and manage employee access within a unified dashboard.

### 1.2 Project Scope
Jobby Employer Platform is a full-stack web application consisting of:
- A **React (TypeScript + Vite)** Single-Page Application (SPA) frontend
- A **NestJS (TypeScript)** Backend-for-Frontend (BFF) service
- Integration with external services: Auth Service, PostgreSQL database, and Neo4j graph database
- Deployment via **CI/CD pipeline** on cloud infrastructure (Render.com)

### 1.3 Intended Audience
- Development team
- DevOps engineers
- Evaluators / course instructors

---

## 2. System Overview

### 2.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Internet                       │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼───────────┐
          │    Frontend (React)    │  Port: 80/443
          │    Vite SPA + Tailwind │  Static build
          └────────────┬───────────┘
                       │ HTTP API calls
          ┌────────────▼───────────┐
          │  BFF (NestJS)          │  Port: 4444
          │  jobby-employer-bff    │
          └──────┬──────┬──────────┘
                 │      │
    ┌────────────▼──┐  ┌▼────────────────┐
    │  Auth Service │  │ Jobby DB Service │
    │ (external)    │  │  (external)      │
    │ Port: 4450    │  │ PostgreSQL+Neo4j │
    └───────────────┘  └─────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React + TypeScript | 19.x |
| Frontend Build | Vite | 7.x |
| Frontend Styling | Tailwind CSS + shadcn/ui | 4.x |
| Frontend State | Zustand | 5.x |
| Frontend Auth | better-auth client | 1.4.x |
| Backend Framework | NestJS | 11.x |
| Backend Runtime | Bun / Node.js | 1.3.x / 24.x |
| Backend Validation | class-validator + class-transformer | 0.14.x |
| API Documentation | Swagger (OpenAPI) | 11.x |
| File Storage | Google Cloud Storage | 7.x |
| Containerization | Docker | - |
| CI/CD | GitHub Actions | - |
| Cloud Hosting | Render.com | - |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization (FR-AUTH)

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | Users can register a new account with email and password via `/signup` |
| FR-AUTH-02 | Users can sign in with email and password via `/signin` |
| FR-AUTH-03 | Sessions are managed via `better-auth.session_token` cookie |
| FR-AUTH-04 | Backend guards validate session tokens against the auth service before processing requests |
| FR-AUTH-05 | User roles in a company: `employer_admin`, `manager`, `hr`, `staff`, `jobby_user` |
| FR-AUTH-06 | A user may belong to multiple companies with different roles per company |
| FR-AUTH-07 | Company setup is required after first registration via `/company-setup` |

### 3.2 Company Profile Management (FR-COMPANY)

| ID | Requirement |
|----|-------------|
| FR-COMPANY-01 | Employers can view and update company basic info: name, email, phone, address |
| FR-COMPANY-02 | Employers can upload a company logo and banner image (multipart/form-data) |
| FR-COMPANY-03 | Employers can edit a company "About" description section (rich text) |
| FR-COMPANY-04 | Employers can add additional company information (social links, website, etc.) |
| FR-COMPANY-05 | A user can retrieve all company IDs associated with their user account |
| FR-COMPANY-06 | The profile page displays the company's currently open job listings |

### 3.3 Job Management (FR-JOB)

| ID | Requirement |
|----|-------------|
| FR-JOB-01 | Employers can create new job postings with full details |
| FR-JOB-02 | Job details include: title, description, Thai address, work type, work options, salary range |
| FR-JOB-03 | Jobs can have skill requirements linked to a Neo4j skill graph (by element ID) |
| FR-JOB-04 | Jobs can include custom screening questions (radio, checkbox, or open-ended) |
| FR-JOB-05 | Employers can update all fields of an existing job posting |
| FR-JOB-06 | Employers can change job status (e.g., published, closed, archived) |
| FR-JOB-07 | Job postings are synchronized to both PostgreSQL and Neo4j on creation |

### 3.4 Application Monitoring (FR-APPLY)

| ID | Requirement |
|----|-------------|
| FR-APPLY-01 | Employers can view a dashboard of new and recent applications |
| FR-APPLY-02 | Applications can be filtered by: status, skills, candidate name, job title |
| FR-APPLY-03 | Employers can view detailed information about a single application |
| FR-APPLY-04 | Employers can update the status of an application (pipeline progression) |
| FR-APPLY-05 | Employers can star/unstar applications to mark top candidates |
| FR-APPLY-06 | Applications are automatically marked as viewed when opened |
| FR-APPLY-07 | Applications can be filtered by skill, experience, achievement, and project match percentages |
| FR-APPLY-08 | Skill suggestions are available for filter autocomplete |

### 3.5 Job Monitor (FR-JOBMON)

| ID | Requirement |
|----|-------------|
| FR-JOBMON-01 | Employers can view all job postings for their company |
| FR-JOBMON-02 | Jobs can be filtered by search term, status, and sort order |
| FR-JOBMON-03 | Job listings support pagination |

### 3.6 Scout / Talent Discovery (FR-SCOUT)

| ID | Requirement |
|----|-------------|
| FR-SCOUT-01 | Employers can discover candidates whose skills match open positions |
| FR-SCOUT-02 | Scout results can be filtered by candidate name, email, and job name |
| FR-SCOUT-03 | Employers can star/unstar scout candidates for follow-up |
| FR-SCOUT-04 | Results support pagination |

### 3.7 Employee Management (FR-EMP)

| ID | Requirement |
|----|-------------|
| FR-EMP-01 | Admins can add a user to their company by email and assigned role |
| FR-EMP-02 | Admins can view the employee list with search and role filters |
| FR-EMP-03 | Admins can remove an employee's access to the company |
| FR-EMP-04 | Employees are paginated in the listing view |

### 3.8 Utility / Reference Data (FR-UTIL)

| ID | Requirement |
|----|-------------|
| FR-UTIL-01 | System provides Thai provinces, districts, sub-districts, and postal code lookup |
| FR-UTIL-02 | System provides phone region / dialing code reference data |
| FR-UTIL-03 | System provides option types: work types, work options, apply status, job status, sort-by options |

### 3.9 Messaging (FR-MSG)

| ID | Requirement |
|----|-------------|
| FR-MSG-01 | A messaging page exists for communication between employer and candidates |
| FR-MSG-02 | Real-time updates are supported via WebSocket (Socket.IO) |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)
- NFR-PERF-01: API responses for paginated list endpoints should complete within 2 seconds under normal load
- NFR-PERF-02: Frontend initial page load should complete within 3 seconds on a standard connection

### 4.2 Security (NFR-SEC)
- NFR-SEC-01: All sensitive routes in the BFF are protected by the `SessionUserMatchGuard`
- NFR-SEC-02: CORS is restricted to allowed origins defined in the `CORS_ORIGINS` environment variable
- NFR-SEC-03: Credentials are stored in environment variables and never committed to the repository
- NFR-SEC-04: File uploads are validated and stored in Google Cloud Storage (not served directly from the server)
- NFR-SEC-05: Session tokens are validated against the external auth service on every guarded request

### 4.3 Maintainability (NFR-MAINT)
- NFR-MAINT-01: Backend modules follow NestJS modular architecture (one module per domain)
- NFR-MAINT-02: All API endpoints are documented via Swagger at `/api`
- NFR-MAINT-03: DTOs use class-validator decorators for input validation
- NFR-MAINT-04: Frontend services are separated by domain with a shared HTTP client layer

### 4.4 Scalability (NFR-SCALE)
- NFR-SCALE-01: The application is containerized with Docker for portable deployment
- NFR-SCALE-02: Backend is stateless; session state is held by the external auth service

### 4.5 Availability (NFR-AVAIL)
- NFR-AVAIL-01: CI/CD pipeline auto-deploys to Render.com on every push to the `main` branch
- NFR-AVAIL-02: Health check endpoint (`/health`) is available for uptime monitoring

---

## 5. System Interfaces

### 5.1 External Services

| Service | URL (env var) | Purpose |
|---------|--------------|---------|
| Auth Service | `JOBBY_AUTH_SERVICE_URL` | Session validation, sign-in/sign-up |
| Jobby DB Service | `JOBBY_DB_POSTGRES_URL` | PostgreSQL data (jobs, companies, employees) |
| Neo4j DB Service | `JOBBY_DB_Neo4J_URL` | Graph-based skill matching |
| Google Cloud Storage | GCS credentials | Company logo and banner storage |

### 5.2 Frontend ↔ BFF API Proxy (Vite)

All frontend API calls are proxied through Vite's dev server (and Nginx/reverse-proxy in production):

| Proxy Path | Backend Route |
|-----------|--------------|
| `/company` | NestJS `/company` |
| `/job` | NestJS `/job` |
| `/apply-monitor` | NestJS `/apply-monitor` |
| `/employee` | NestJS `/employee` |
| `/scout` | NestJS `/scout` |
| `/utility` | NestJS `/utility` |
| `/api/auth-employer` | Auth Service (external) |

---

## 6. Environment Configuration

### 6.1 Backend Environment Variables (`Back/jobby-employer-bff/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | BFF service port | `4444` |
| `JOBBY_DB_POSTGRES_URL` | PostgreSQL service URL | `http://host:3001` |
| `JOBBY_DB_Neo4J_URL` | Neo4j service URL | `http://host:3002` |
| `JOBBY_AUTH_SERVICE_URL` | Auth service URL | `http://host:4450` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

### 6.2 Frontend Environment Variables (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_BETTER_AUTH_URL` | Auth endpoint prefix for better-auth client |
| `VITE_BETTER_AUTH_PROXY_TARGET` | Target URL for auth proxy |
| `VITE_APP_BASE_URL` | BFF base URL for API calls |

---

## 7. CI/CD and Deployment

### 7.1 CI/CD Pipeline Overview

```
Developer → git push → GitHub (main branch)
                           │
                    GitHub Actions
                    ┌──────▼──────────────────┐
                    │  1. Checkout code        │
                    │  2. Install dependencies │
                    │  3. Run lint / typecheck  │
                    │  4. Build Docker image   │
                    │  5. Push to registry     │
                    └──────┬──────────────────┘
                           │ webhook / auto-deploy
                    ┌──────▼──────────────────┐
                    │      Render.com          │
                    │  - Web Service (BFF)     │
                    │  - Static Site (Frontend)│
                    └─────────────────────────┘
```

### 7.2 Deployment Targets

| Component | Render.com Service Type | Build Command | Start Command |
|-----------|------------------------|---------------|---------------|
| Frontend | Static Site | `npm run build` | N/A (served statically) |
| BFF Backend | Web Service (Docker) | Dockerfile | `node dist/main` |

### 7.3 Workflow Triggers
- **CI**: Triggered on every `push` and `pull_request` to `main`
- **CD**: Auto-deploy triggered by Render.com on successful push to `main`

---

## 8. Data Flow Diagram

```
User (Browser)
    │
    │  1. Login → POST /api/auth-employer/sign-in/email
    ▼
Frontend SPA (React)
    │
    │  2. Authenticated API call (Bearer token / cookie)
    ▼
BFF (NestJS) ─── SessionUserMatchGuard
    │                   │
    │           3. Validate session
    │           GET JOBBY_AUTH_SERVICE_URL/api/auth/get-session
    │                   │
    │           ◄─── user_id confirmed
    │
    │  4. Fetch/mutate data
    ├──► Postgres Service (jobs, companies, employees, applications)
    └──► Neo4j Service (skill graph, talent matching)
```

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| BFF | Backend-for-Frontend — a backend service tailored for a specific frontend client |
| SRS | Software Requirements Specification |
| CI/CD | Continuous Integration / Continuous Delivery |
| SPA | Single-Page Application |
| better-auth | An open-source authentication library for TypeScript |
| Scout | Feature to discover and recommend candidates based on skill matching |
| Neo4j | A graph database used for skill relationship and talent matching |
| Render.com | Cloud platform for hosting web services and static sites |
