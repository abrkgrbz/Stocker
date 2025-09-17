# Stocker Web - Production Deployment Guide

## 📋 Prerequisites

- Node.js 20+ 
- Docker and Docker Compose
- GitHub account with repository access
- Server with Ubuntu 20.04+ or similar
- Domain name configured (optional)

## 🚀 Quick Start

### 1. Local Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Docker Deployment

```bash
# Build Docker image
docker build -t stocker-web:latest .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f stocker-web

# Stop container
docker-compose down
```

## 🔧 Configuration

### Environment Variables

Create `.env.production` file:

```env
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Build Arguments

When building Docker image with custom API URL:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  -t stocker-web:latest .
```

## 📦 CI/CD Pipeline

### GitHub Actions Setup

1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:

```yaml
DOCKER_USERNAME: your-docker-hub-username
DOCKER_PASSWORD: your-docker-hub-password
VITE_API_URL: https://api.yourdomain.com
VITE_API_BASE_URL: https://api.yourdomain.com
DEPLOY_HOST: your-server-ip
DEPLOY_USER: your-server-username
DEPLOY_KEY: your-ssh-private-key
DEPLOY_PORT: 22
```

### Automatic Deployment

The CI/CD pipeline automatically:
1. Runs tests on every PR
2. Builds Docker image on merge to main
3. Pushes to Docker Hub and GitHub Container Registry
4. Deploys to production server

## 🖥️ Server Setup

### Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directory
sudo mkdir -p /opt/stocker
cd /opt/stocker

# Create docker-compose.yml
sudo nano docker-compose.yml
```

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  stocker-web:
    image: ghcr.io/yourusername/stocker-web:latest
    container_name: stocker-web
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - stocker-network

  # Optional: Nginx reverse proxy with SSL
  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - stocker-web
    restart: unless-stopped
    networks:
      - stocker-network

networks:
  stocker-network:
    driver: bridge
```

## 🔒 SSL Configuration (Optional)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Nginx SSL Configuration

Create `nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://stocker-web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring

### Health Check

```bash
# Check container status
docker ps

# Check application health
curl http://localhost/health

# View logs
docker logs stocker-web --tail 100 -f
```

### Performance Monitoring

```bash
# Resource usage
docker stats stocker-web

# Disk usage
df -h

# Memory usage
free -m
```

## 🔄 Updates and Rollback

### Update Application

```bash
# Pull latest image
docker pull ghcr.io/yourusername/stocker-web:latest

# Restart with new image
docker-compose up -d

# Verify deployment
docker-compose ps
```

### Rollback Procedure

```bash
# Tag current version before update
docker tag stocker-web:latest stocker-web:backup

# If rollback needed
docker-compose down
docker tag stocker-web:backup stocker-web:latest
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker logs stocker-web
   docker-compose down
   docker-compose up -d
   ```

2. **Build failures**
   ```bash
   # Clean build
   docker system prune -af
   docker-compose build --no-cache
   ```

3. **Network issues**
   ```bash
   # Check network
   docker network ls
   docker network inspect stocker-network
   ```

4. **Permission issues**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER /opt/stocker
   ```

### Debug Mode

```bash
# Run in foreground with debug
docker-compose up

# Interactive shell
docker exec -it stocker-web sh
```

## 📈 Performance Optimization

### Build Optimization
- Bundle size target: < 2MB
- Lazy loading for routes
- Code splitting for large components
- Image optimization with WebP

### Runtime Optimization
- Enable gzip compression (nginx.conf)
- Cache static assets (1 year)
- Use CDN for static files
- Enable HTTP/2

## 📝 Maintenance

### Regular Tasks

Weekly:
- Check disk space
- Review error logs
- Update dependencies

Monthly:
- Security updates
- Performance review
- Backup configuration

### Backup Strategy

```bash
# Backup configuration
tar -czf stocker-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  nginx.conf \
  .env

# Automated backup script
0 2 * * * /opt/stocker/backup.sh
```

## 🆘 Support

For issues or questions:
1. Check logs: `docker logs stocker-web`
2. Review GitHub Issues
3. Contact DevOps team

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)