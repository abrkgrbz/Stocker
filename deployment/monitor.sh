#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
EMAIL_TO="${ALERT_EMAIL:-}"
LOG_FILE="/app/stocker/logs/monitor.log"

# Services to monitor
declare -A SERVICES=(
    ["API"]="http://localhost:5104/health"
    ["Web"]="http://localhost:3000"
    ["SignalR"]="http://localhost:5104/hubs/validation"
    ["Database"]="postgres://postgres:StockerDb2024!@localhost:5432/stocker_master"
    ["Redis"]="redis://localhost:6379"
)

# State tracking
ALERT_SENT_FILE="/tmp/stocker_alerts_sent"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo -e "$1"
}

send_alert() {
    local service=$1
    local status=$2
    local message=$3
    
    # Check if alert was already sent
    if grep -q "${service}_${status}" "$ALERT_SENT_FILE" 2>/dev/null; then
        return
    fi
    
    # Send Slack notification if configured
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST $SLACK_WEBHOOK_URL \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"🚨 Stocker Alert: ${service} is ${status}\\n${message}\"}" \
            2>/dev/null
    fi
    
    # Send Discord notification if configured
    if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST $DISCORD_WEBHOOK_URL \
            -H 'Content-Type: application/json' \
            -d "{\"content\":\"🚨 **Stocker Alert**: ${service} is ${status}\\n${message}\"}" \
            2>/dev/null
    fi
    
    # Mark alert as sent
    echo "${service}_${status}" >> "$ALERT_SENT_FILE"
}

check_http_service() {
    local name=$1
    local url=$2
    local response_time
    
    response_time=$(curl -o /dev/null -s -w '%{time_total}' $url 2>/dev/null)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_message "${GREEN}✓${NC} $name is healthy (${response_time}s)"
        # Clear alert if service recovered
        sed -i "/${name}_down/d" "$ALERT_SENT_FILE" 2>/dev/null
        return 0
    else
        log_message "${RED}✗${NC} $name is down"
        send_alert "$name" "down" "Service is not responding at $url"
        return 1
    fi
}

check_postgres() {
    if docker exec stocker-db pg_isready -U postgres > /dev/null 2>&1; then
        log_message "${GREEN}✓${NC} PostgreSQL is healthy"
        sed -i "/Database_down/d" "$ALERT_SENT_FILE" 2>/dev/null
        return 0
    else
        log_message "${RED}✗${NC} PostgreSQL is down"
        send_alert "Database" "down" "PostgreSQL is not responding"
        return 1
    fi
}

check_redis() {
    if docker exec stocker-redis redis-cli -a Redis2024! ping > /dev/null 2>&1; then
        log_message "${GREEN}✓${NC} Redis is healthy"
        sed -i "/Redis_down/d" "$ALERT_SENT_FILE" 2>/dev/null
        return 0
    else
        log_message "${RED}✗${NC} Redis is down"
        send_alert "Redis" "down" "Redis is not responding"
        return 1
    fi
}

check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        log_message "${YELLOW}⚠${NC} Disk usage is high: ${usage}%"
        send_alert "Disk" "warning" "Disk usage is at ${usage}%"
    else
        log_message "${GREEN}✓${NC} Disk usage is normal: ${usage}%"
    fi
}

check_memory() {
    local mem_total=$(free -m | awk 'NR==2 {print $2}')
    local mem_used=$(free -m | awk 'NR==2 {print $3}')
    local mem_percent=$((mem_used * 100 / mem_total))
    
    if [ $mem_percent -gt 80 ]; then
        log_message "${YELLOW}⚠${NC} Memory usage is high: ${mem_percent}%"
        send_alert "Memory" "warning" "Memory usage is at ${mem_percent}%"
    else
        log_message "${GREEN}✓${NC} Memory usage is normal: ${mem_percent}%"
    fi
}

check_container_health() {
    local unhealthy=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" | wc -l)
    if [ $unhealthy -gt 0 ]; then
        log_message "${RED}✗${NC} Found $unhealthy unhealthy containers"
        docker ps --filter "health=unhealthy" --format "table {{.Names}}\t{{.Status}}"
        send_alert "Containers" "unhealthy" "$unhealthy containers are unhealthy"
    else
        log_message "${GREEN}✓${NC} All containers are healthy"
    fi
}

generate_report() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Stocker Health Monitor Report${NC}"
    echo -e "${BLUE}   $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Check all services
    local total_services=0
    local healthy_services=0
    
    check_http_service "API" "${SERVICES[API]}" && ((healthy_services++))
    ((total_services++))
    
    check_http_service "Web" "${SERVICES[Web]}" && ((healthy_services++))
    ((total_services++))
    
    check_http_service "SignalR" "${SERVICES[SignalR]}" && ((healthy_services++))
    ((total_services++))
    
    check_postgres && ((healthy_services++))
    ((total_services++))
    
    check_redis && ((healthy_services++))
    ((total_services++))
    
    echo ""
    echo -e "${BLUE}System Resources:${NC}"
    echo -e "${BLUE}========================================${NC}"
    check_disk_space
    check_memory
    check_container_health
    
    echo ""
    echo -e "${BLUE}Container Statistics:${NC}"
    echo -e "${BLUE}========================================${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo -e "${BLUE}========================================${NC}"
    if [ $healthy_services -eq $total_services ]; then
        echo -e "${GREEN}✓ All services are operational ($healthy_services/$total_services)${NC}"
    else
        echo -e "${YELLOW}⚠ Some services need attention ($healthy_services/$total_services)${NC}"
    fi
    
    # Recent logs
    echo ""
    echo -e "${BLUE}Recent API Errors (last 10):${NC}"
    echo -e "${BLUE}========================================${NC}"
    docker logs stocker-api 2>&1 | grep -i error | tail -10 || echo "No recent errors"
}

# Main execution
mkdir -p $(dirname $LOG_FILE)
touch "$ALERT_SENT_FILE"

if [ "$1" = "--continuous" ]; then
    log_message "Starting continuous monitoring (every 60 seconds)..."
    while true; do
        generate_report
        sleep 60
        clear
    done
else
    generate_report
fi