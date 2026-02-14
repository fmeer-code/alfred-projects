#!/bin/bash
# Simple healthcheck for population.araneo.org
# If the site is unreachable, restart the cloudflared named tunnel service.

URL="https://population.araneo.org"
SERVICE="cloudflared-tunnel.service"

LOGFILE="/var/log/population-srv-healthcheck.log"

echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') Checking ${URL}" >> "$LOGFILE"

if curl -sfS "$URL" >/dev/null; then
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') OK" >> "$LOGFILE"
  exit 0
else
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') DOWN — attempting restart of $SERVICE" >> "$LOGFILE"
  sudo systemctl restart "$SERVICE" && echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') Restarted $SERVICE" >> "$LOGFILE" || echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') Failed to restart $SERVICE" >> "$LOGFILE"
  exit 1
fi
