# RIVOT Motors HRMS & Payroll System - Ubuntu VM Deployment Guide

This guide details how to launch an Ubuntu Virtual Machine (AWS EC2, Google Cloud Compute Engine, DigitalOcean, or Azure) and run the automated script to deploy **RIVOT HRMS** at `https://hrms.rivotmotors.com`.

---

## 1. Quick One-Line Automated Deployment

Launch a fresh **Ubuntu 22.04 LTS or 24.04 LTS** instance (minimum recommended specs: 2 vCPU, 2GB or 4GB RAM).

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Upload or clone the repository into your server, or run the deployment script directly:
```bash
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh
```

---

## 2. Pointing Your DNS (A Record)

1. Open your DNS provider (Cloudflare, GoDaddy, Namecheap, Route53, etc.).
2. Locate the DNS records for `rivotmotors.com`.
3. Add an **A Record**:
   - **Type**: `A`
   - **Name / Host**: `hrms` (or `hrms.rivotmotors.com`)
   - **Value / IPv4**: `YOUR_UBUNTU_VM_PUBLIC_IP`
   - **TTL**: Auto or 300 seconds
4. If you used Cloudflare, ensure SSL is set to **Full** or **Full (Strict)**.

---

## 3. SSL Certificate (HTTPS)

The script automatically runs Certbot to obtain a free, auto-renewing Let's Encrypt SSL certificate. If you run the script before pointing the DNS, simply execute this command once the DNS has propagated:

```bash
sudo certbot --nginx -d hrms.rivotmotors.com
```

Let's Encrypt certificates renew automatically via a systemd timer.

---

## 4. Useful Operational Commands

- **Check Application Status**:
  ```bash
  pm2 status
  ```
- **View Live Application Logs**:
  ```bash
  pm2 logs rivot-hrms
  ```
- **Restart Application**:
  ```bash
  pm2 restart rivot-hrms
  ```
- **Reload Nginx**:
  ```bash
  sudo systemctl reload nginx
  ```
- **Update to Latest Code**:
  ```bash
  cd /var/www/rivot-hrms
  git pull
  npm install
  npm run build
  pm2 restart rivot-hrms
  ```
