#!/bin/bash

echo "Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "Stopping existing nginx if running..."
sudo systemctl stop nginx

echo "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/stoocker > /dev/null <<'EOF'
# API Backend
server {
    listen 80;
    server_name api.stoocker.app;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://stoocker.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}

# Frontend
server {
    listen 80;
    server_name stoocker.app www.stoocker.app;

    location / {
        proxy_pass http://127.0.0.1:3000;
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
EOF

echo "Enabling site configuration..."
sudo ln -sf /etc/nginx/sites-available/stoocker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "Testing nginx configuration..."
sudo nginx -t

echo "Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo "Nginx installed and configured!"
echo ""
echo "Getting SSL certificates..."
echo "Please make sure your domains are pointing to this server before proceeding."
echo ""

# Get SSL certificates
sudo certbot --nginx -d stoocker.app -d www.stoocker.app -d api.stoocker.app --non-interactive --agree-tos --email info@stoocker.app --redirect

echo ""
echo "Setup complete!"
echo "Your sites should be available at:"
echo "  - https://stoocker.app"
echo "  - https://www.stoocker.app"
echo "  - https://api.stoocker.app"
echo ""
echo "Make sure your Docker containers are running on:"
echo "  - API: port 5000"
echo "  - Frontend: port 3000"