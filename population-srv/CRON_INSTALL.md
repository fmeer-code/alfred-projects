To install the hourly healthcheck cron job for population.araneo.org

1) Copy the script into place (already created at population-srv/scripts/check_population_site.sh)
2) Make it executable (done): chmod +x population-srv/scripts/check_population_site.sh
3) Add to root's crontab so it runs every hour (recommended):

   sudo crontab -e

Add the following line (runs at minute 0 every hour):

   0 * * * * /root/clawd/population-srv/scripts/check_population_site.sh

Notes:
- The script writes logs to /var/log/population-srv-healthcheck.log (ensure the file is writable by root).
- The script uses sudo systemctl restart cloudflared-tunnel.service; because crontab runs as root when editing root's crontab, sudo is optional.
- If you prefer a systemd timer instead of cron, I can create a unit + timer and install it for you.
