#!/bin/bash
# deploy.sh — Tracx VPS deployment script
# Run on the VPS as: bash /var/www/tracx/deploy.sh
# Or for first-time setup: bash deploy.sh --setup

set -e  # Exit on any error

APP_DIR="/var/www/tracx"
LOG_DIR="/var/log/tracx"
REPO="https://github.com/JahongirOfficial/tracx.git"
PM2_APP="tracx-server"
NGINX_CONF="/etc/nginx/sites-available/tracx"

echo "========================================="
echo "  Tracx Deploy — $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# ── First-time setup ──────────────────────────────────────────
if [ "$1" = "--setup" ]; then
  echo "[SETUP] Installing system dependencies..."

  # Node.js 20 LTS
  if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi

  # PM2
  if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
  fi

  # Docker + Docker Compose
  if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
  fi

  # Certbot
  if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
  fi

  echo "[SETUP] Creating directories..."
  mkdir -p "$APP_DIR" "$LOG_DIR"

  echo "[SETUP] Cloning repository..."
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"

  echo ""
  echo "[SETUP] ============================================"
  echo "[SETUP] Now do the following before continuing:"
  echo ""
  echo "  1. Create server/.env:"
  echo "     cp $APP_DIR/server/.env.production.example $APP_DIR/server/.env"
  echo "     nano $APP_DIR/server/.env"
  echo "     # Set: TRACX_DB_PASSWORD, TRACX_REDIS_PASSWORD, JWT secrets, etc."
  echo ""
  echo "  2. Set DB/Redis passwords as env vars:"
  echo "     export TRACX_DB_PASSWORD='your_strong_db_password'"
  echo "     export TRACX_REDIS_PASSWORD='your_strong_redis_password'"
  echo ""
  echo "  3. Start Docker containers:"
  echo "     docker compose -f $APP_DIR/docker-compose.prod.yml up -d"
  echo ""
  echo "  4. Setup nginx:"
  echo "     cp $APP_DIR/nginx.conf $NGINX_CONF"
  echo "     ln -s $NGINX_CONF /etc/nginx/sites-enabled/tracx"
  echo "     nginx -t && systemctl reload nginx"
  echo ""
  echo "  5. Get SSL certificate:"
  echo "     certbot --nginx -d tracx.biznesjon.uz"
  echo ""
  echo "  6. Run full deploy:"
  echo "     bash $APP_DIR/deploy.sh"
  echo ""
  echo "[SETUP] Done with setup preparation."
  exit 0
fi

# ── Regular deploy (update) ───────────────────────────────────
cd "$APP_DIR"

echo "[1/7] Pulling latest code from GitHub..."
git pull origin main

echo "[2/7] Installing server dependencies..."
cd "$APP_DIR/server"
npm install --omit=dev

echo "[3/7] Running Prisma migrations..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "[4/7] Seeding SuperAdmin (safe — upsert)..."
node src/seed/superAdmin.js

echo "[5/7] Building frontend..."
cd "$APP_DIR/client"
npm install
npm run build
echo "  Frontend built → client/dist/"

echo "[6/7] Restarting PM2..."
cd "$APP_DIR"
if pm2 list | grep -q "$PM2_APP"; then
  pm2 reload ecosystem.config.js --env production
else
  pm2 start ecosystem.config.js --env production
fi
pm2 save

echo "[7/7] Reloading nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "========================================="
echo "  Deploy complete!"
echo "  App:  https://tracx.biznesjon.uz"
echo "  Logs: pm2 logs $PM2_APP"
echo "========================================="
