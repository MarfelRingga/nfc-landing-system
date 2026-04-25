#!/bin/bash

# ==============================================================================
# Supabase Backup & Monitoring Script
# ==============================================================================
# Requirements: pg_dump, rclone, curl
# Usage: ./supabase_backup.sh
# ==============================================================================

# Load environment variables from .env file if it exists in the same directory
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

# Path Configuration (Defaults to relative path if not set)
BACKUP_LOCAL_PATH=${BACKUP_LOCAL_PATH:-"./backups"}
RCLONE_REMOTE_NAME=${RCLONE_REMOTE_NAME:-"gdrive"}
RCLONE_DEST_PATH=${RCLONE_DEST_PATH:-"rifelo-backup"}

# Required Environment Variables (Set these in .env or your OS):
# - DB_URL
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_CHAT_ID
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY

TIMESTAMP=$(date +"%y%m%d_%H%M%S")
BACKUP_NAME="supabase_backup_$TIMESTAMP.sql"
LOCAL_FILE="$BACKUP_LOCAL_PATH/$BACKUP_NAME"
LOG_ID=""

# Ensure local backup directory exists
mkdir -p "$BACKUP_LOCAL_PATH"

# Helper to log to Supabase
log_to_supabase() {
    local status=$1
    local file_size=$2
    local error_msg=$3
    local finished_at=$4
    
    local payload="{\"status\": \"$status\", \"file_name\": \"$BACKUP_NAME\", \"file_size\": $file_size, \"error_message\": \"$error_msg\""
    if [ ! -z "$finished_at" ]; then
        payload="$payload, \"finished_at\": \"$finished_at\""
    fi
    payload="$payload}"

    if [ -z "$LOG_ID" ]; then
        # Initial insert
        response=$(curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/backup_logs" \
            -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=representation" \
            -d "$payload")
        LOG_ID=$(echo $response | grep -oP '(?<="id":")[^"]+')
    else
        # Update existing
        curl -s -X PATCH "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/backup_logs?id=eq.$LOG_ID" \
            -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
            -H "Content-Type: application/json" \
            -d "$payload"
    fi
}

# Helper to send Telegram notification
notify_telegram() {
    local message=$1
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=🚨 Supabase Backup Alert: $message" \
        -d "parse_mode=Markdown"
}

# 1. Initialize Log
log_to_supabase "running" 0 "" ""

# 2. Start Backup (pg_dump)
echo "Starting pg_dump..."
pg_dump "$DB_URL" > "$LOCAL_FILE"
PG_EXIT=$?

if [ $PG_EXIT -ne 0 ]; then
    ERR="pg_dump failed with exit code $PG_EXIT"
    log_to_supabase "failed" 0 "$ERR" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    notify_telegram "$ERR"
    exit 1
fi

# 3. Check if file is empty
FILE_SIZE=$(stat -c%s "$LOCAL_FILE")
if [ $FILE_SIZE -le 100 ]; then # Threshold for "empty" or just header
    ERR="Backup file is suspiciously small ($FILE_SIZE bytes). Potential failure."
    log_to_supabase "failed" $FILE_SIZE "$ERR" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    notify_telegram "$ERR"
    exit 1
fi

# 4. Upload to Google Drive (rclone)
echo "Starting rclone upload..."
rclone copy "$LOCAL_FILE" "$RCLONE_REMOTE_NAME:$RCLONE_DEST_PATH"
RCLONE_EXIT=$?

if [ $RCLONE_EXIT -ne 0 ]; then
    ERR="rclone upload failed with exit code $RCLONE_EXIT"
    log_to_supabase "failed" $FILE_SIZE "$ERR" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    notify_telegram "$ERR"
    exit 1
fi

# 5. Success
echo "Backup successful!"
log_to_supabase "success" $FILE_SIZE "" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
rm "$LOCAL_FILE" # Optional: cleanup local file
