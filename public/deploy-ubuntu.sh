#!/usr/bin/env bash
# ==============================================================================
# RIVOT MOTORS - Automated HRMS & Payroll System Production Deployment Script
# Target OS: Ubuntu 22.04 / 24.04 LTS
# Domain: https://hrms.rivotmotors.com
# Port: 3000 (Internal) -> 80 / 443 (External Nginx + Let's Encrypt SSL)
# ==============================================================================

set -e

DOMAIN="hrms.rivotmotors.com"
APP_DIR="/var/www/rivot-hrms"
NODE_VERSION="20"
ADMIN_EMAIL="admin@rivotmotors.com"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${ORANGE}"
echo "======================================================================"
echo "    ____  _____ _    ______  ______   __  _______  __________  ____  _____"
echo "   / __ \/  _/ | / / __ \/_  __/  /  |/  / __ \/_  __/ __ \/ __ \/ ___/"
echo "  / /_/ // / | | / / / / / / /    / /|_/ / / / / / / / / / / /_/ /\__ \ "
echo " / _, _// /  | |/ / /_/ / / /    / /  / / /_/ / / / / /_/ / _, _/___/ / "
echo "/_/ |_/___/  |___/\____/ /_/    /_/  /_/\____/ /_/  \____/_/ |_|/____/  "
echo "                                                                      "
echo "  HRMS & Payroll System Automated Provisioning Script for Ubuntu VM   "
echo "======================================================================"
echo -e "${NC}"

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this script as root or with sudo.${NC}"
  exit 1
fi

echo -e "${BLUE}[STEP 1/8] Updating Ubuntu system packages...${NC}"
apt-get update -y
apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw

echo -e "${BLUE}[STEP 2/8] Installing Node.js ${NODE_VERSION} LTS & NPM...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1)" != "v${NODE_VERSION}" ]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) and NPM $(npm -v) installed.${NC}"

# Install PM2 globally for background process supervision
npm install -g pm2

echo -e "${BLUE}[STEP 3/8] Setting up Application Directory at ${APP_DIR}...${NC}"
mkdir -p "${APP_DIR}"

# If running directly inside the cloned repo directory, copy contents
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ "$SCRIPT_DIR" != "$APP_DIR" ]; then
  echo "Copying source files from ${SCRIPT_DIR} to ${APP_DIR}..."
  cp -r "${SCRIPT_DIR}/." "${APP_DIR}/"
fi

cd "${APP_DIR}"

echo -e "${BLUE}[STEP 4/8] Installing Application Dependencies...${NC}"
npm install

echo -e "${BLUE}[STEP 5/8] Building Production Bundle...${NC}"
npm run build

echo -e "${BLUE}[STEP 6/8] Configuring PM2 Process Manager...${NC}"
pm2 delete rivot-hrms 2>/dev/null || true
pm2 start npm --name "rivot-hrms" -- run preview -- --port 3000 --host 0.0.0.0
pm2 save
pm2 startup systemd -u root --hp /root || true

echo -e "${BLUE}[STEP 7/8] Configuring Nginx Reverse Proxy for ${DOMAIN}...${NC}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

cat > "${NGINX_CONF}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo -e "${BLUE}[STEP 8/8] Configuring UFW Firewall & Provisioning Let's Encrypt SSL...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${ORANGE}Attempting Let's Encrypt SSL Certificate provisioning for ${DOMAIN}...${NC}"
if certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}" --redirect; then
  echo -e "${GREEN}SSL Certificate successfully issued and configured!${NC}"
else
  echo -e "${ORANGE}[WARNING] Certbot could not verify domain ${DOMAIN} immediately.${NC}"
  echo -e "Make sure you have pointed your DNS 'A' Record for ${DOMAIN} to this server's public IP:"
  PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "YOUR_SERVER_IP")
  echo -e "Public IP: ${GREEN}${PUBLIC_IP}${NC}"
  echo -e "Once DNS propagates, run: ${GREEN}certbot --nginx -d ${DOMAIN}${NC}"
fi

echo -e "${GREEN}"
echo "======================================================================"
echo "      RIVOT MOTORS HRMS SYSTEM DEPLOYED SUCCESSFULLY!                 "
echo "======================================================================"
echo -e "${NC}"
echo -e "Application URL: ${GREEN}https://${DOMAIN}${NC}"
echo -e "Service Status:  pm2 status"
echo -e "Nginx Status:    systemctl status nginx"
echo -e "Logs:            pm2 logs rivot-hrms"
echo "======================================================================"
