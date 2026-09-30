# 🚆 SeatScout

> **Smart Indian Railway Seat Availability Tracker & Route Monitoring System**

SeatScout is a web application designed to help users monitor Indian Railway seat availability for selected routes and receive timely information when seats become available.

The project combines a modern web application with a cloud-hosted deployment architecture using **AWS EC2, Nginx, Node.js, systemd, DuckDNS, Elastic IP, and GitHub Actions**.

---

## 🌐 Live Demo

### 🚀 AWS EC2 Deployment

**SeatScout:**  
http://seatscout.duckdns.org

The primary deployment runs on an **AWS EC2 instance in the Asia Pacific (Mumbai) region (`ap-south-1`)**.

### ☁️ Google Cloud Run Backup

If the AWS EC2 instance is stopped or temporarily unavailable, the application is also available through the Google AI Studio / Cloud Run deployment:

https://seatscout-90983624846.us-west1.run.app

---

# 📌 About SeatScout

Finding available railway seats can be difficult when seats are unavailable at the time of booking.

SeatScout aims to simplify this by allowing users to:

- Search railway stations
- Check train availability
- Monitor selected routes
- Track seat availability
- Monitor availability continuously
- Receive availability information when seats become available
- Use radar-style route monitoring
- Support railway quota-based availability scenarios

The application is designed around the idea of:

```text
Search → Track → Monitor → Detect Availability
