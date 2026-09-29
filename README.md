# 🚆 SeatScout

**SeatScout** is a train seat availability tracking and monitoring application built to make Indian Railway seat availability easier to track.

It allows users to search train availability and monitor routes for changes in availability, with background monitoring and notifications designed around the `CURR_AVBL` availability information.

## 🌐 Live Deployments

### ☁️ AWS EC2 Deployment

**Primary deployment:**

http://seatscout.duckdns.org/

This deployment runs on an **AWS EC2 instance** with Nginx, Node.js, systemd, and DuckDNS.

### 🤖 AI Studio / Cloud Run Deployment

**Secondary / fallback deployment:**

https://seatscout-90983624846.us-west1.run.app

This deployment can be used when the AWS EC2 instance is unavailable, for example when the EC2 instance is stopped because of **free-tier credit/resource limitations**.

```text
Primary:
AWS EC2
   ↓
seatscout.duckdns.org

Fallback:
AI Studio / Cloud Run
   ↓
seatscout-90983624846.us-west1.run.app
```

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Live Deployments](#-live-deployments)
* [Key Features](#-key-features)
* [How SeatScout Works](#-how-seatscout-works)
* [Architecture](#-architecture)
* [Application Flow](#-application-flow)
* [Radar Monitoring](#-radar-monitoring)
* [Railway Station System](#-railway-station-system)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Deployment Architecture](#-deployment-architecture)
* [EC2 Infrastructure](#-ec2-infrastructure)
* [Nginx Reverse Proxy](#-nginx-reverse-proxy)
* [Systemd Services](#-systemd-services)
* [DuckDNS IP Mapping](#-duckdns-ip-mapping)
* [CI/CD with GitHub Actions](#-cicd-with-github-actions)
* [Git Workflow](#-git-workflow)
* [Running Locally](#-running-locally)
* [Environment Variables](#-environment-variables)
* [Deployment Flow](#-deployment-flow)
* [Monitoring and Logs](#-monitoring-and-logs)
* [Troubleshooting](#-troubleshooting)
* [Future Improvements](#-future-improvements)

---

# 🚀 Overview

SeatScout was created as a practical **DevOps + full-stack deployment project**.

The project is not only about building a web application. It also demonstrates how an application can be:

1. Developed locally
2. Stored in GitHub
3. Built and packaged
4. Deployed to an AWS EC2 instance
5. Served through Nginx
6. Managed using systemd
7. Exposed through a domain using DuckDNS
8. Automatically deployed using GitHub Actions
9. Continuously monitored through background workers
10. Made available through a secondary Cloud Run deployment when EC2 is unavailable

---

# ✨ Key Features

## 🎫 Train Seat Availability

SeatScout focuses on train seat availability and uses the current availability information (`CURR_AVBL`) to help users understand whether seats are available for a selected journey.

Users can provide journey information such as:

* Source station
* Destination station
* Train
* Travel date
* Passenger/availability requirements

---

## 📡 Radar

The **Radar** feature is designed for continuous monitoring.

Instead of manually checking train availability repeatedly, a user can create a monitoring requirement and SeatScout's background worker can periodically check the required route.

```text
User creates Radar
        ↓
Radar is stored
        ↓
Background monitoring worker
        ↓
Availability checked periodically
        ↓
Availability changes
        ↓
Notification / update
```

This turns SeatScout from a simple search application into a **monitoring system**.

---

## 🔔 Notifications

The monitoring system is designed to notify users when monitored seat availability changes.

```text
No Seat Available
       ↓
Radar continues monitoring
       ↓
Seat becomes available
       ↓
Availability detected
       ↓
Notification sent
```

---

## 👴 Senior Citizen / Lower Berth Quota Support

SeatScout also considers railway quota-related availability, including support around:

* Senior Citizen requirements
* Lower berth requirements
* General availability

---

## 🚉 Indian Railway Station Search

SeatScout contains an in-memory station index containing approximately:

**8,967 Indian Railway stations**

Startup log:

```text
[StationService] Successfully loaded all 8967 Indian Railway stations into in-memory index.
```

---

## ⚙️ 24/7 Background Monitoring Worker

SeatScout includes a background Radar scheduler.

```text
[RadarScheduler] Started 24/7 background seat monitoring worker
```

This means the monitoring process does not depend on a user keeping the browser open.

---

# 🧠 How SeatScout Works

At a high level:

```text
                 ┌─────────────────┐
                 │      User       │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ SeatScout Web UI│
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Public Endpoint│
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Node.js Server │
                 │    Port 3000    │
                 └────────┬────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      ┌───────────────┐       ┌────────────────┐
      │ Seat / Route  │       │ Radar Scheduler│
      │    Services   │       │ Background Job │
      └───────────────┘       └───────┬────────┘
                                      │
                                      ▼
                              Availability Checks
                                      │
                                      ▼
                                  Notifications
```

---

# 🏗️ Architecture

## AWS EC2 Production Architecture

```text
                         INTERNET
                            │
                            ▼
                 ┌───────────────────────┐
                 │ seatscout.duckdns.org │
                 └───────────┬───────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      Nginx      │
                    │ Reverse Proxy   │
                    └────────┬────────┘
                             │
                             │ localhost:3000
                             ▼
                    ┌─────────────────┐
                    │    Node.js      │
                    │  SeatScout App  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌───────────────┐             ┌─────────────────┐
      │ Application   │             │ Radar Scheduler │
      │   Services    │             │ Background      │
      └───────────────┘             │ Monitoring      │
                                    └─────────────────┘
```

---

# ☁️ Dual Deployment Architecture

SeatScout currently has two accessible deployment endpoints:

```text
                         SEATSCOUT
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
          AWS EC2 Deployment       Cloud Run Deployment
                │                         │
                ▼                         ▼
     seatscout.duckdns.org     seatscout-90983624846.
                               us-west1.run.app
                │                         │
                ▼                         ▼
             Nginx                    Cloud Run
                │                         │
                ▼                         ▼
            Node.js                  SeatScout App
             :3000
```

The AWS deployment demonstrates the **hands-on DevOps infrastructure**, while the Cloud Run deployment provides an alternate way to access the application.

---

# 🔄 Application Flow

For the AWS deployment:

```text
Browser
   │
   ▼
DuckDNS Domain
   │
   ▼
Nginx
   │
   ▼
Node.js :3000
   │
   ▼
SeatScout Application
   │
   ├── Station Service
   ├── Availability Logic
   ├── Radar Service
   └── Notification Logic
```

For the Cloud Run deployment:

```text
Browser
   │
   ▼
Cloud Run URL
   │
   ▼
SeatScout Application
```

---

# 📡 Radar Monitoring

Radar is one of the key concepts in SeatScout.

## Radar Lifecycle

```text
Create Radar
     │
     ▼
Store Monitoring Request
     │
     ▼
Radar Scheduler
     │
     ▼
Periodic Availability Check
     │
     ├───────────────┐
     │               │
     ▼               ▼
No Change         Change Found
     │               │
     ▼               ▼
Continue          Process Event
Monitoring            │
                      ▼
                 Notification
```

---

# 🚉 Railway Station System

SeatScout loads railway station data into memory when the server starts.

```text
Application starts
       ↓
StationService initializes
       ↓
~8967 stations loaded
       ↓
In-memory station index created
       ↓
Application starts accepting requests
```

---

# 🛠️ Technology Stack

## Frontend

* Angular
* TypeScript
* JavaScript
* HTML
* CSS

## Backend

* Node.js
* Server-side JavaScript
* Compiled application output
* `dist/server.cjs`

## Cloud & DevOps

* AWS EC2
* Amazon Linux 2023
* Nginx
* systemd
* DuckDNS
* Google Cloud Run
* Git
* GitHub
* GitHub Actions
* SSH

## Development / Collaboration

* GitHub
* GitHub Actions
* Postman
* Jira
* Agile/Scrum workflow

---

# 📁 Project Structure

```text
SeatScout/
│
├── src/
│   ├── ...
│   ├── services/
│   ├── components/
│   └── ...
│
├── public/
│
├── dist/
│   └── server.cjs
│
├── .github/
│   └── workflows/
│       └── ...
│
├── scripts/
│
├── package.json
├── package-lock.json
├── deploy.sh
├── .gitignore
└── README.md
```

> The exact structure may change as the application continues to evolve.

---

# ☁️ EC2 Infrastructure

The AWS deployment uses:

```text
Cloud Provider  : AWS
Service         : EC2
Operating System: Amazon Linux 2023
Node.js         : v22.23.2
Application Port: 3000
Reverse Proxy   : Nginx
```

The Node.js application listens internally on:

```text
0.0.0.0:3000
```

---

# 🌐 Nginx Reverse Proxy

```text
Internet
   │
   ▼
Nginx :80 / :443
   │
   ▼
Node.js :3000
```

Example:

```text
http://seatscout.duckdns.org
              │
              ▼
          Nginx
              │
              ▼
      http://127.0.0.1:3000
              │
              ▼
        SeatScout Server
```

---

# ⚙️ systemd Services

SeatScout uses Linux `systemd` to manage production processes.

## SeatScout Application

```text
seatscout.service
```

Purpose:

* Start the SeatScout server automatically
* Manage the application process
* Keep the application running as a background service
* Start the application after EC2 reboot

---

## DuckDNS Update Service

```text
duckdns-update.service
```

Associated script:

```text
update-duckdns.sh
```

Its purpose is to update DuckDNS with the current EC2 public IP.

---

# 🌍 DuckDNS IP Mapping

The EC2 public IPv4 address can change after a stop/start cycle.

```text
EC2 boots
   │
   ▼
duckdns-update.service
   │
   ▼
update-duckdns.sh
   │
   ▼
Get current EC2 public IP
   │
   ▼
Update DuckDNS
   │
   ▼
seatscout.duckdns.org
   │
   ▼
New EC2 IP
```

This removes the need to manually update the DNS record after every EC2 restart.

---

# 🔐 CI/CD with GitHub Actions

The project uses GitHub as the central source-code repository and GitHub Actions as the foundation for automated deployment.

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Checkout code
    ├── Prepare deployment
    ├── Connect through SSH
    └── Deploy to EC2
            │
            ▼
          EC2
            │
            ▼
       Update code
            │
            ▼
       Build application
            │
            ▼
      Restart service
            │
            ▼
       SeatScout live
```

---

# 🔑 GitHub Actions SSH Authentication

GitHub Actions connects to EC2 using SSH authentication.

```text
GitHub Actions
      │
      │ SSH
      ▼
AWS EC2
      │
      ▼
Deployment Commands
```

Private keys and credentials should be stored in **GitHub Secrets**, never committed to the repository.

Possible secret names:

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
```

---

# 🚀 Deployment Flow

```text
1. Developer changes code
          ↓
2. git add .
          ↓
3. git commit
          ↓
4. git push origin main
          ↓
5. GitHub Actions starts
          ↓
6. Repository is checked out
          ↓
7. GitHub Actions connects to EC2
          ↓
8. Latest code is deployed
          ↓
9. Application is built
          ↓
10. seatscout.service is restarted
          ↓
11. Node.js starts on port 3000
          ↓
12. Nginx forwards requests
          ↓
13. SeatScout is updated
```

---

# 💻 Running Locally

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SeatScout
```

Install dependencies:

```bash
npm install
```

Run the configured development script from `package.json`.

For example:

```bash
npm run dev
```

or:

```bash
npm start
```

---

# 🔐 Environment Variables

Sensitive configuration should never be committed to GitHub.

Examples:

```env
API_KEY=
DATABASE_URL=
DUCKDNS_TOKEN=
NODE_ENV=production
```

Sensitive files should be included in `.gitignore`.

---

# 🚫 .gitignore

Typical examples:

```gitignore
node_modules/
.env
.env.*
dist/
*.log
*.pem
*.key
```

---

# 📊 Production Process Management

Check SeatScout:

```bash
sudo systemctl status seatscout.service
```

Restart:

```bash
sudo systemctl restart seatscout.service
```

Start:

```bash
sudo systemctl start seatscout.service
```

Stop:

```bash
sudo systemctl stop seatscout.service
```

Enable at boot:

```bash
sudo systemctl enable seatscout.service
```

---

# 📜 Logs

View recent SeatScout logs:

```bash
sudo journalctl -u seatscout.service -n 100
```

Follow logs live:

```bash
sudo journalctl -u seatscout.service -f
```

DuckDNS logs:

```bash
sudo journalctl -u duckdns-update.service -n 100
```

---

# 🔍 Troubleshooting

## Check Node.js

```bash
ps aux | grep node
```

## Check port 3000

```bash
sudo ss -ltnp | grep 3000
```

## Test application locally

```bash
curl http://localhost:3000
```

## Check Nginx

```bash
sudo systemctl status nginx
```

## Test Nginx configuration

```bash
sudo nginx -t
```

## Restart Nginx

```bash
sudo systemctl restart nginx
```

---

# ⚠️ EADDRINUSE / Port Already in Use

One issue encountered during development was:

```text
Error: EADDRINUSE: address already in use 0.0.0.0:3000
```

This means another process is already listening on port `3000`.

Check:

```bash
sudo ss -ltnp | grep 3000
```

or:

```bash
sudo lsof -i :3000
```

When using systemd, manage the application through:

```bash
sudo systemctl restart seatscout.service
```

rather than manually starting multiple Node.js processes.

---

# 🗺️ Future Infrastructure Improvement

The current AWS setup uses:

```text
EC2
  ↓
Changing Public IP
  ↓
DuckDNS
```

A future AWS-oriented production architecture could use:

```text
                    Route 53
                       │
                       ▼
                Elastic IP / ALB
                       │
                       ▼
                    Nginx
                       │
                       ▼
                 Node.js App
                       │
                       ▼
                  AWS Compute
```

Potential improvements:

* Elastic IP
* Route 53
* HTTPS with SSL/TLS
* Docker
* Amazon ECR
* ECS / Kubernetes
* Application Load Balancer
* CloudWatch
* Centralized logging
* Auto Scaling
* Infrastructure as Code
* Automated rollback

---

# 🔮 Future Improvements

```text
✔ HTTPS
✔ Elastic IP
✔ Route 53
✔ Docker
✔ AWS ECR
✔ ECS / Kubernetes
✔ Better notification system
✔ Database-backed Radar persistence
✔ CloudWatch integration
✔ Health checks
✔ Automated rollback
✔ Infrastructure as Code
✔ Improved CI/CD pipeline
```

---

# 🎯 Project Goal

SeatScout started as a railway seat availability application and evolved into a practical **DevOps deployment project**.

The overall journey:

```text
Code
  ↓
Git
  ↓
GitHub
  ↓
GitHub Actions
  ↓
SSH
  ↓
AWS EC2
  ↓
systemd
  ↓
Node.js
  ↓
Nginx
  ↓
DuckDNS
  ↓
🌐 Live Application
```

With a secondary deployment:

```text
SeatScout
   │
   ├── AWS EC2
   │      └── http://seatscout.duckdns.org/
   │
   └── Cloud Run
          └── https://seatscout-90983624846.us-west1.run.app
```

---

# 👨‍💻 Author

**Nit**

Built as a hands-on project to explore:

```text
Full Stack Development
        +
Cloud
        +
Linux
        +
AWS
        +
CI/CD
        +
DevOps
```

---

# 🌐 Project Links

### Primary AWS Deployment

http://seatscout.duckdns.org/

### Secondary Cloud Run Deployment

https://seatscout-90983624846.us-west1.run.app

---

## ⭐ **SeatScout** is a practical demonstration of taking an application from local development all the way to cloud deployment and automated DevOps infrastructure.
