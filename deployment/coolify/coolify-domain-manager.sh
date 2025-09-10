#!/bin/bash

# Coolify Domain Manager Script
# Usage: ./coolify-domain-manager.sh [add|remove] <app-uuid> <domain>

ACTION=$1
APP_UUID=$2
DOMAIN=$3

if [ -z "$ACTION" ] || [ -z "$APP_UUID" ] || [ -z "$DOMAIN" ]; then
    echo "Usage: $0 [add|remove] <app-uuid> <domain>"
    exit 1
fi

# Coolify database connection
COOLIFY_DB="coolify-db"
DB_USER="coolify"
DB_NAME="coolify"

# Function to execute PostgreSQL query
execute_query() {
    docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -c "$1"
}

# Function to get application ID from UUID
get_app_id() {
    local uuid=$1
    docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT id FROM applications WHERE uuid = '$uuid';" | xargs
}

# Function to add domain
add_domain() {
    local app_id=$(get_app_id $APP_UUID)
    
    if [ -z "$app_id" ]; then
        echo "Application not found: $APP_UUID"
        exit 1
    fi
    
    # Check if domain already exists
    existing=$(docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT fqdn FROM applications WHERE id = $app_id;" | xargs)
    
    if [[ "$existing" == *"$DOMAIN"* ]]; then
        echo "Domain already exists: $DOMAIN"
        exit 0
    fi
    
    # Get current domains
    current_domains=$(docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT fqdn FROM applications WHERE id = $app_id;" | xargs)
    
    # Add new domain
    if [ -z "$current_domains" ]; then
        new_domains="$DOMAIN"
    else
        new_domains="$current_domains
$DOMAIN"
    fi
    
    # Update domains
    docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -c \
        "UPDATE applications SET fqdn = '$new_domains' WHERE id = $app_id;"
    
    echo "Domain added: $DOMAIN"
    
    # Trigger redeploy
    trigger_redeploy $app_id
}

# Function to remove domain
remove_domain() {
    local app_id=$(get_app_id $APP_UUID)
    
    if [ -z "$app_id" ]; then
        echo "Application not found: $APP_UUID"
        exit 1
    fi
    
    # Get current domains and remove the specified one
    current_domains=$(docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT fqdn FROM applications WHERE id = $app_id;" | xargs)
    
    # Remove domain from list
    new_domains=$(echo "$current_domains" | grep -v "$DOMAIN")
    
    # Update domains
    docker exec $COOLIFY_DB psql -U $DB_USER -d $DB_NAME -c \
        "UPDATE applications SET fqdn = '$new_domains' WHERE id = $app_id;"
    
    echo "Domain removed: $DOMAIN"
    
    # Trigger redeploy
    trigger_redeploy $app_id
}

# Function to trigger redeploy
trigger_redeploy() {
    local app_id=$1
    
    # Find the container and restart it
    container=$(docker ps --format "{{.Names}}" | grep "$APP_UUID")
    
    if [ ! -z "$container" ]; then
        docker restart $container
        echo "Application redeployed"
    else
        echo "Warning: Could not find container to restart"
    fi
}

# Main execution
case $ACTION in
    add)
        add_domain
        ;;
    remove)
        remove_domain
        ;;
    *)
        echo "Invalid action: $ACTION"
        echo "Usage: $0 [add|remove] <app-uuid> <domain>"
        exit 1
        ;;
esac