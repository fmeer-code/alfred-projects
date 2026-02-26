#!/bin/bash
# Called by Clawdbot cron wrapper: checks for failure flag and notifies via an ephemeral file for the assistant.
FLAG="/var/run/population-srv-down.flag"
NOTIFY_MARKER="/tmp/population_notify_pending"

if [ -f "$FLAG" ]; then
  echo "1" > "$NOTIFY_MARKER"
else
  [ -f "$NOTIFY_MARKER" ] && rm -f "$NOTIFY_MARKER"
fi
