#!/bin/bash

# Generate htpasswd file for basic authentication
# Usage: ./generate-htpasswd.sh [username] [password]

set -e

# Default values
USERNAME=${1:-admin}
PASSWORD=${2:-$(openssl rand -base64 12)}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Generating htpasswd file ===${NC}"

# Check if htpasswd is available
if ! command -v htpasswd &> /dev/null; then
    echo -e "${YELLOW}htpasswd not found, using Docker...${NC}"
    docker run --rm -i httpd:alpine htpasswd -nb "${USERNAME}" "${PASSWORD}" > ./nginx/.htpasswd
else
    htpasswd -cb ./nginx/.htpasswd "${USERNAME}" "${PASSWORD}"
fi

echo -e "${GREEN}Basic authentication file created:${NC}"
echo -e "  File:     ./nginx/.htpasswd"
echo -e "  Username: ${USERNAME}"
echo -e "  Password: ${PASSWORD}"
echo ""
echo -e "${YELLOW}Please save this password in a secure location!${NC}"

# Add additional users if needed
while true; do
    read -p "Do you want to add another user? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        break
    fi
    
    read -p "Enter username: " ADD_USERNAME
    read -s -p "Enter password (leave empty for random): " ADD_PASSWORD
    echo
    
    if [ -z "${ADD_PASSWORD}" ]; then
        ADD_PASSWORD=$(openssl rand -base64 12)
        echo -e "Generated password: ${ADD_PASSWORD}"
    fi
    
    if ! command -v htpasswd &> /dev/null; then
        docker run --rm -i httpd:alpine htpasswd -nb "${ADD_USERNAME}" "${ADD_PASSWORD}" >> ./nginx/.htpasswd
    else
        htpasswd -b ./nginx/.htpasswd "${ADD_USERNAME}" "${ADD_PASSWORD}"
    fi
    
    echo -e "${GREEN}User ${ADD_USERNAME} added successfully${NC}"
done

echo -e "${GREEN}Done!${NC}"