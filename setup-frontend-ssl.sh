#!/bin/bash

# Frontend SSL Setup Script for stoocker.app

echo "Setting up SSL for stoocker.app..."

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Create nginx config for frontend
cat > /etc/nginx/sites-available/stoocker.app << 'EOF'
server {
    listen 80;
    server_name stoocker.app www.stoocker.app;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name stoocker.app www.stoocker.app;

    # SSL certificates will be added by certbot
    # ssl_certificate /etc/letsencrypt/live/stoocker.app/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/stoocker.app/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;
    
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/stoocker.app /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# Get SSL certificate
echo "Getting SSL certificate for stoocker.app..."
certbot --nginx -d stoocker.app -d www.stoocker.app --non-interactive --agree-tos --email info@stoocker.app

# Setup auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "SSL setup completed for stoocker.app!"
echo "Please make sure:"
echo "1. DNS A records point to this server"
echo "2. Port 80 and 443 are open"
echo "3. Frontend container is running on port 3000"