Known issues & troubleshooting — population-srv

Last updated: 2026-02-14 UTC

Summary
-------
This document records a recurring "white screen" / unreachable UI problem observed with population.araneo.org and how to diagnose and fix it quickly.

Symptoms
--------
- Browser shows a blank/white page (or the UI shows "Loading..." indefinitely).
- Cloudflare (Argo) returns 200 but the app's dynamic content never appears or the page fails to load resources.
- Server is running locally but the public site is not reachable through the tunnel.

Root causes seen so far
----------------------
1) cloudflared tunnel process stopped, crashed, or got disconnected
   - The named tunnel service runs as cloudflared-tunnel.service (not always cloudflared.service). When it is not running, the site becomes inaccessible from the outside.

2) Backend bound to loopback-only (127.0.0.1)
   - If the app binds explicitly to 127.0.0.1 and the tunnel/proxy expects a different interface, the reverse proxy may fail to reach it. Prefer binding to 0.0.0.0 or omit the host argument when calling app.listen().

3) Misconfigured country config or invalid JSON
   - If country config files are malformed or validation fails, the API may return errors and the UI can display errors or not render. Check server logs for INVALID_CONFIG responses.

Quick fixes (in order)
----------------------
1) Restart the cloudflared tunnel service
   - Identify the service name: `systemctl list-units --type=service --all | grep -i cloudflared`
   - Common service name in this environment: `cloudflared-tunnel.service`
   - Restart and check status:
     sudo systemctl restart cloudflared-tunnel.service
     sudo systemctl status cloudflared-tunnel.service --no-pager -l
   - After restart, verify the site responds:
     curl -I -sS https://population.araneo.org

2) If the tunnel restart does not fix it, check the population service binding and logs
   - Confirm server.js listen call; prefer `app.listen(port)` or `app.listen(port, '0.0.0.0')`.
   - If necessary, change `app.listen(port, '127.0.0.1', ...)` → `app.listen(port, '0.0.0.0', ...)` and restart the population process.
   - Start/stop/restart the population service (depends on how it is run; if via systemd, use the service name). Example (if running manually):
     pkill -f server.js || true
     cd /root/clawd/population-srv && nohup node server.js &

3) Inspect server logs and API endpoints
   - Check the API endpoints directly to see errors:
     curl -sS http://127.0.0.1:3002/api/countries | jq .
     curl -sS "http://127.0.0.1:3002/api/population?country=switzerland" | jq .
   - Look for errors in server console or systemd journal if running as a service.

Notes about what we did on 2026-02-14
------------------------------------
- Restarted `cloudflared-tunnel.service` and confirmed it became active (running).
- Verified `https://population.araneo.org` returned HTTP/2 200 from Cloudflare.
- Observed that server.js currently binds to 127.0.0.1; consider changing to 0.0.0.0 if the reverse proxy requires it.

Contact / escalation
--------------------
- If the tunnel repeatedly fails, check Cloudflare dashboard and the local cloudflared config at ~/.cloudflared/config.yml for authentication/token issues.
- For persistent crashes, collect cloudflared logs: `journalctl -u cloudflared-tunnel.service -n 200 --no-pager` and open an issue with the logs attached.

Helpful commands
----------------
- Find cloudflared unit: systemctl list-units --type=service --all | grep -i cloudflared
- Restart tunnel: sudo systemctl restart cloudflared-tunnel.service
- Tail logs: sudo journalctl -u cloudflared-tunnel.service -f
- Test site: curl -I https://population.araneo.org
- Test local API: curl -sS http://127.0.0.1:3002/api/countries


Change log
----------
2026-02-14 — Created file after tunnel restart that resolved the white-screen issue.

