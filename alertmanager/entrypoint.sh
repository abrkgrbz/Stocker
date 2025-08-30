#!/bin/sh
set -e

# Function to replace environment variables in template
envsubst_config() {
    # Use sed to replace environment variables since envsubst might not be available
    cp /etc/alertmanager/config.yml.template /tmp/config.yml
    
    # Replace environment variables with their values or defaults
    sed -i "s|\${SENDGRID_API_KEY}|${SENDGRID_API_KEY:-}|g" /tmp/config.yml
    sed -i "s|\${FROM_EMAIL:-alerts@stoocker.app}|${FROM_EMAIL:-alerts@stoocker.app}|g" /tmp/config.yml
    sed -i "s|\${SMTP_HOST:-smtp.sendgrid.net}|${SMTP_HOST:-smtp.sendgrid.net}|g" /tmp/config.yml
    sed -i "s|\${SMTP_PORT:-587}|${SMTP_PORT:-587}|g" /tmp/config.yml
    sed -i "s|\${SMTP_USERNAME:-apikey}|${SMTP_USERNAME:-apikey}|g" /tmp/config.yml
    sed -i "s|\${ALERT_EMAIL:-admin@stoocker.app}|${ALERT_EMAIL:-admin@stoocker.app}|g" /tmp/config.yml
    sed -i "s|\${CRITICAL_ALERT_EMAIL:-critical-alerts@stoocker.app}|${CRITICAL_ALERT_EMAIL:-critical-alerts@stoocker.app}|g" /tmp/config.yml
    sed -i "s|\${DB_ALERT_EMAIL:-database-team@stoocker.app}|${DB_ALERT_EMAIL:-database-team@stoocker.app}|g" /tmp/config.yml
    sed -i "s|\${BACKEND_ALERT_EMAIL:-backend-team@stoocker.app}|${BACKEND_ALERT_EMAIL:-backend-team@stoocker.app}|g" /tmp/config.yml
    sed -i "s|\${OPS_ALERT_EMAIL:-ops-team@stoocker.app}|${OPS_ALERT_EMAIL:-ops-team@stoocker.app}|g" /tmp/config.yml
    
    # Move the processed config to the correct location
    mv /tmp/config.yml /etc/alertmanager/config.yml
    
    echo "AlertManager configuration processed successfully"
}

# Process the configuration template
envsubst_config

# Start AlertManager with the processed config
exec /bin/alertmanager \
    --config.file=/etc/alertmanager/config.yml \
    --storage.path=/alertmanager \
    --web.external-url=${EXTERNAL_URL:-https://alerts.stoocker.app} \
    "$@"