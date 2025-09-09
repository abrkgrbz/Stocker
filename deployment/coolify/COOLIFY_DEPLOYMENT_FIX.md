# Coolify Deployment Fix

## Error: "lstat /stocker-web: no such file or directory"

This error occurs because Coolify can't find the build context. Here are the solutions:

## Solution 1: Use GitHub Source (RECOMMENDED)

### In Coolify UI:
1. **Delete current application**
2. **Create New Application**
3. Choose **"Public Repository"**
4. Enter:
   - Repository: `https://github.com/yourusername/stocker`
   - Branch: `main` or `master`
   - Build Pack: **Dockerfile**
   - Base Directory: `.` (leave empty or just a dot)
   - Dockerfile Location: `stocker-web/Dockerfile`

## Solution 2: Use Docker Hub/GitHub Container Registry

### First, build and push locally:
```bash
# Build image
cd C:\Users\PC\source\repos\Stocker
docker build -t yourdockerhub/stocker-web:latest -f stocker-web/Dockerfile .

# Push to registry
docker push yourdockerhub/stocker-web:latest
```

### Then in Coolify:
1. Create New Application
2. Choose **"Docker Image"**
3. Image: `yourdockerhub/stocker-web:latest`

## Solution 3: Use Docker Compose with Build Command

### In Coolify, use this Docker Compose:
```yaml
version: '3.8'
services:
  web:
    image: node:18-alpine
    container_name: stocker-web
    working_dir: /app
    command: |
      sh -c "
      apk add --no-cache git &&
      git clone https://github.com/yourusername/stocker.git /app &&
      cd /app/stocker-web &&
      npm install &&
      npm run build &&
      npm install -g serve &&
      serve -s dist -l 80
      "
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.stoocker.app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web-wildcard.rule=HostRegexp(`{subdomain:[a-z0-9-]+}.stoocker.app`)"
      - "traefik.http.services.web-service.loadbalancer.server.port=80"
    networks:
      - coolify

networks:
  coolify:
    external: true
```

## Solution 4: Manual Deployment via SSH

### SSH to your server and run:
```bash
# Clone repository
cd /tmp
git clone https://github.com/yourusername/stocker.git
cd stocker

# Build Docker image
docker build -t stocker-web:local -f stocker-web/Dockerfile .

# Stop old container
docker stop stocker-web 2>/dev/null
docker rm stocker-web 2>/dev/null

# Run new container with wildcard labels
docker run -d \
  --name stocker-web \
  --network coolify \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e VITE_API_URL=https://api.stoocker.app \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.web-main.rule=Host(\`stoocker.app\`) || Host(\`www.stoocker.app\`)" \
  -l "traefik.http.routers.web-wildcard.rule=HostRegexp(\`{subdomain:[a-z0-9-]+}.stoocker.app\`)" \
  -l "traefik.http.services.web.loadbalancer.server.port=80" \
  stocker-web:local

echo "Deployment complete!"
```

## Quick Fix for Current Error

### In Coolify UI:
1. Go to your application
2. Click **"Variables"** or **"Environment"**
3. Add:
   ```
   BUILD_CONTEXT=/
   DOCKERFILE_PATH=stocker-web/Dockerfile
   ```

4. In **"Build Configuration"**:
   - Build Command: `cd / && ls -la`
   - This will show you what Coolify sees

5. Change **Source** to:
   - Type: **Git Repository**
   - URL: `https://github.com/yourusername/stocker`
   - This avoids path issues entirely

## Testing Wildcard Routing

After deployment, test:
```bash
# Should all work automatically
curl https://demo.stoocker.app
curl https://techstart.stoocker.app
curl https://newclient.stoocker.app
```

All subdomains will be routed to the same container thanks to the wildcard rule!