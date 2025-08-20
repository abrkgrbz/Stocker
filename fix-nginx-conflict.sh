#!/bin/bash

echo "Checking what's using port 80..."
sudo lsof -i :80

echo ""
echo "Checking running Docker containers..."
docker ps

echo ""
echo "Stopping Coolify's Traefik if running..."
docker stop $(docker ps -q --filter "name=traefik") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=coolify-proxy") 2>/dev/null || true

echo ""
echo "Stopping nginx..."
sudo systemctl stop nginx

echo ""
echo "Killing any process on port 80..."
sudo fuser -k 80/tcp 2>/dev/null || true

echo ""
echo "Removing duplicate nginx configurations..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/stocker.conf
sudo rm -f /etc/nginx/sites-available/stocker.conf

echo ""
echo "Cleaning up nginx sites..."
# Keep only our configuration
sudo ls /etc/nginx/sites-enabled/ | grep -v stoocker | xargs -I {} sudo rm -f /etc/nginx/sites-enabled/{}

echo ""
echo "Creating clean nginx configuration..."
sudo tee /etc/nginx/sites-available/stoocker > /dev/null <<'EOF'
# API Backend
server {
    listen 80;
    server_name api.stoocker.app;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name stoocker.app www.stoocker.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Default server to catch all other requests
server {
    listen 80 default_server;
    server_name _;
    return 444;
}
EOF

echo ""
echo "Enabling only our site..."
sudo ln -sf /etc/nginx/sites-available/stoocker /etc/nginx/sites-enabled/stoocker

echo ""
echo "Testing nginx configuration..."
sudo nginx -t

echo ""
echo "Starting nginx..."
sudo systemctl start nginx
sudo systemctl status nginx --no-pager

echo ""
echo "Checking if port 80 is now bound to nginx..."
sudo lsof -i :80

echo ""
echo "Testing endpoints..."
echo "API Health Check:"
curl -I http://api.stoocker.app/health

echo ""
echo "Now you can run certbot for SSL:"
echo "sudo certbot --nginx -d stoocker.app -d www.stoocker.app -d api.stoocker.app --non-interactive --agree-tos --email info@stoocker.app --redirect"