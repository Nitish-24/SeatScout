# 🚆 SeatScout

**SeatScout** is a train seat availability tracking and monitoring application built to make Indian Railway seat availability easier to track.

It allows users to search train availability and monitor routes for changes in availability, with background monitoring and notifications designed around the `CURR_AVBL` availability information.

🌐 **Live Website:** http://seatscout.duckdns.org/

---

## 📌 Table of Contents

* [Overview](#-overview)
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

The application runs as a Node.js server behind Nginx on an **Amazon Linux 2023 EC2 instance**.

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

Conceptually:

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

Example:

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

The application distinguishes between relevant quota/availability information instead of treating every availability result as identical.

---

## 🚉 Indian Railway Station Search

SeatScout contains an in-memory station index containing approximately:

**8,967 Indian Railway stations**

This allows station-related operations to be handled efficiently without repeatedly rebuilding the station index for every request.

Startup log:

```text
[StationService] Successfully loaded all 8967 Indian Railway stations into in-memory index.
```

---

## ⚙️ 24/7 Background Monitoring Worker

SeatScout includes a background Radar scheduler.

The production server starts the monitoring worker automatically:

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
                 │  Nginx / HTTPS  │
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

## Production Architecture

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

# 🔄 Application Flow

A typical request follows this path:

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

Nginx acts as the public-facing entry point while the Node.js application runs internally on port `3000`.

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

The monitoring worker runs independently from the web request/response cycle.

This allows SeatScout to continue checking routes even when the user is not actively using the website.

---

# 🚉 Railway Station System

SeatScout loads railway station data into memory when the server starts.

Current startup behavior:

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

This provides fast station lookup during application usage.

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

## DevOps / Deployment

* AWS EC2
* Amazon Linux 2023
* Nginx
* systemd
* DuckDNS
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

A simplified representation of the project:

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

# ☁️ Deployment Architecture

SeatScout is hosted on an **AWS EC2 instance running Amazon Linux 2023**.

The production setup can be represented as:

```text
                      GitHub
                        │
                        │ git push
                        ▼
                ┌─────────────────┐
                │ GitHub Actions  │
                └────────┬────────┘
                         │
                         │ SSH
                         ▼
                  ┌───────────────┐
                  │ AWS EC2       │
                  │ Amazon Linux  │
                  └───────┬───────┘
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
              Nginx             systemd
                 │                 │
                 │                 ▼
                 │          SeatScout Service
                 │                 │
                 │                 ▼
                 │             Node.js
                 │              :3000
                 │
                 ▼
        seatscout.duckdns.org
```

---

# ☁️ EC2 Infrastructure

The current production environment uses:

```text
Cloud Provider : AWS
Service        : EC2
Operating System: Amazon Linux 2023
Node.js        : v22.23.2
Application Port: 3000
Reverse Proxy  : Nginx
```

The Node.js application listens internally on:

```text
0.0.0.0:3000
```

Nginx receives public web traffic and forwards it to the application.

---

# 🌐 Nginx Reverse Proxy

Nginx provides the public entry point for SeatScout.

Conceptually:

```text
Internet
   │
   ▼
Nginx :80 / :443
   │
   ▼
Node.js :3000
```

Instead of exposing the Node.js application directly to users, Nginx forwards requests internally.

Example architecture:

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

## SeatScout Application Service

Service:

```text
seatscout.service
```

Purpose:

* Start the SeatScout server automatically
* Restart/manage the application process
* Allow the application to run as a background service
* Start the application after EC2 reboot

Conceptually:

```text
EC2 starts
   ↓
systemd starts
   ↓
seatscout.service
   ↓
Node.js server starts
   ↓
SeatScout available on :3000
```

---

## DuckDNS Update Service

Another service is used for IP mapping:

```text
duckdns-update.service
```

Its purpose is to update DuckDNS whenever the EC2 public IP changes.

The associated script:

```text
update-duckdns.sh
```

updates the DuckDNS record using the current EC2 public IP.

---

# 🌍 DuckDNS IP Mapping

The original EC2 setup uses a public IPv4 address that can change when the instance is stopped and started.

For example:

```text
Before restart:

EC2 Public IP
     ↓
13.x.x.x
     ↓
seatscout.duckdns.org
```

After an instance restart:

```text
New EC2 Public IP
     ↓
54.x.x.x
     ↓
DuckDNS record must be updated
```

SeatScout handles this automatically using the DuckDNS update service.

## Current Flow

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

The project is designed around a GitHub-based deployment workflow.

The basic idea is:

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

The deployment architecture uses SSH authentication so GitHub Actions can connect securely to the EC2 server.

The general flow is:

```text
GitHub Actions
      │
      │ SSH Private Key
      ▼
AWS EC2
      │
      ▼
Deployment Commands
```

The private key must **never be committed to GitHub**.

Sensitive values should be stored using:

```text
GitHub Repository Secrets
```

Examples of secrets that may be used:

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
```

Actual secret values should not appear inside source code or the README.

---

# 🚀 Deployment Flow

The intended automated deployment process is:

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
7. GitHub Actions connects to EC2 using SSH
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

The goal is to reduce manual commands on EC2 after every GitHub push.

---

# 🔄 Git Workflow

Typical local workflow:

```bash
git status
```

Check changed files.

```bash
git add .
```

Stage changes.

```bash
git commit -m "Update SeatScout"
```

Create a commit.

```bash
git push origin main
```

Push changes to GitHub.

After a successful CI/CD workflow, the latest version can be deployed to EC2 automatically.

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

Run the development environment using the project's configured npm scripts.

For example:

```bash
npm run dev
```

or:

```bash
npm start
```

depending on the current `package.json` configuration.

---

# 🔐 Environment Variables

Sensitive configuration should be stored outside the Git repository.

Examples:

```env
API_KEY=
DATABASE_URL=
DUCKDNS_TOKEN=
NODE_ENV=production
```

Never commit secrets such as:

* API keys
* Passwords
* SSH private keys
* Access tokens
* Cloud credentials
* Database credentials

Use:

```text
.env
```

and make sure sensitive files are included in `.gitignore`.

---

# 🚫 .gitignore

Sensitive and generated files should not be pushed to GitHub.

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

The exact `.gitignore` should match the project's actual build and deployment requirements.

---

# 📊 Production Process Management

Useful commands on EC2:

## Check SeatScout service

```bash
sudo systemctl status seatscout.service
```

## Restart SeatScout

```bash
sudo systemctl restart seatscout.service
```

## Start SeatScout

```bash
sudo systemctl start seatscout.service
```

## Stop SeatScout

```bash
sudo systemctl stop seatscout.service
```

## Enable at boot

```bash
sudo systemctl enable seatscout.service
```

---

# 📜 Logs

SeatScout logs can be inspected through `journalctl`.

View recent application logs:

```bash
sudo journalctl -u seatscout.service -n 100
```

Follow logs live:

```bash
sudo journalctl -u seatscout.service -f
```

View DuckDNS service logs:

```bash
sudo journalctl -u duckdns-update.service -n 100
```

Follow DuckDNS logs:

```bash
sudo journalctl -u duckdns-update.service -f
```

---

# 🔍 Troubleshooting

## Check whether Node.js is running

```bash
ps aux | grep node
```

## Check port 3000

```bash
sudo ss -ltnp | grep 3000
```

## Test the application locally on EC2

```bash
curl http://localhost:3000
```

## Check Nginx status

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

One issue encountered during deployment was:

```text
Error: EADDRINUSE: address already in use 0.0.0.0:3000
```

This means another process is already listening on port `3000`.

Check the process:

```bash
sudo ss -ltnp | grep 3000
```

or:

```bash
sudo lsof -i :3000
```

When using systemd, the preferred approach is to manage the application through:

```bash
sudo systemctl restart seatscout.service
```

rather than manually starting multiple Node.js processes.

---

# 🧱 Current Production Architecture Summary

```text
                     USER
                       │
                       ▼
              seatscout.duckdns.org
                       │
                       ▼
                    Nginx
                       │
                       ▼
                Node.js :3000
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    SeatScout App              Radar Scheduler
         │                           │
         ▼                           ▼
 Station Service              Availability Checks
         │                           │
         ▼                           ▼
 ~8967 stations                 Notifications


       AWS EC2 / Amazon Linux 2023
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
 seatscout.service     duckdns-update.service
          │                   │
          ▼                   ▼
     Node.js App         update-duckdns.sh
                              │
                              ▼
                     Current EC2 Public IP
                              │
                              ▼
                      DuckDNS DNS Record


                    GitHub
                      │
                      ▼
                GitHub Actions
                      │
                      ▼
                 SSH to EC2
                      │
                      ▼
               Automated Deployment
```

---

# 🧩 Why This Architecture?

The project demonstrates several important DevOps concepts together:

### Application

SeatScout provides the actual business functionality for railway seat monitoring.

### Nginx

Nginx acts as a reverse proxy and provides the public web entry point.

### Node.js

The SeatScout backend runs as a Node.js service on port `3000`.

### systemd

systemd keeps the application running and allows it to start automatically after a server reboot.

### DuckDNS

DuckDNS provides a domain name that can be updated when the EC2 public IP changes.

### GitHub

GitHub provides source-code management and version control.

### GitHub Actions

GitHub Actions provides the foundation for automated CI/CD.

### AWS EC2

EC2 provides the production compute environment.

Together, these components create a complete development-to-production workflow.

---

# 🗺️ Future Infrastructure Improvement

The current architecture uses **DuckDNS + automatic public-IP mapping**.

A future production-oriented architecture can replace this with:

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
                 AWS EC2 / ECS
```

Possible improvements include:

* AWS Elastic IP
* Route 53 DNS
* HTTPS with SSL/TLS
* Docker containerization
* Amazon ECR
* ECS / Kubernetes
* Application Load Balancer
* CloudWatch monitoring
* Centralized logging
* Auto Scaling
* Infrastructure as Code
* GitHub Actions with stronger deployment strategies

The important architectural improvement is eliminating dependency on a changing EC2 public IP.

---

# 🔮 Future Improvements

Potential next steps for SeatScout include:

```text
✔ HTTPS
✔ Elastic IP
✔ Route 53
✔ Docker
✔ AWS ECR
✔ ECS / Kubernetes
✔ Better notification system
✔ Database-backed Radar persistence
✔ Improved monitoring
✔ CloudWatch integration
✔ Health checks
✔ Automated rollback
✔ Infrastructure as Code
✔ Improved CI/CD pipeline
```

---

# 🎯 Project Goal

SeatScout started as a railway seat availability application and evolved into a practical **DevOps deployment project**.

The project demonstrates the complete journey:

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

## 🌐 Live Project

**SeatScout:** http://seatscout.duckdns.org/

⭐ Star the repository if you find the project useful.

---
