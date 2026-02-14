#!/bin/bash
set -e
# Restore stable tag 'stable-2026-02-14' into working tree and restart service
cd /root/clawd
if git rev-parse --verify stable-2026-02-14 >/dev/null 2>&1; then
  git checkout stable-2026-02-14 -- population-srv/static/index.html || true
  git checkout stable-2026-02-14 -- population-srv/server.js || true
  git checkout stable-2026-02-14 -- population-srv/config.json || true
else
  echo "Tag stable-2026-02-14 not found. Restoring from backups/index.stable.2026-02-14.html"
  cp backups/index.stable.2026-02-14.html population-srv/static/index.html
fi
systemctl --user restart population-srv.service
echo "Restored stable version and restarted population-srv.service"
