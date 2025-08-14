#!/bin/bash

# Coolify'da Dockerfile sorununu çözme script'i

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Coolify Deployment Fix${NC}"
echo -e "${BLUE}========================================${NC}"

# Repository'yi güncelle
echo -e "${YELLOW}Updating repository...${NC}"
cd /opt/stocker
git pull origin main 2>/dev/null || echo "Could not pull, continuing..."

# Dockerfile'ları kontrol et
echo -e "${YELLOW}Checking Dockerfiles...${NC}"
if [ ! -f "Dockerfile.coolify" ]; then
    echo -e "${YELLOW}Creating Dockerfile.coolify...${NC}"
    cat > Dockerfile.coolify << 'EOF'
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "src/API/Stocker.API/Stocker.API.csproj"
RUN dotnet publish "src/API/Stocker.API/Stocker.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development
HEALTHCHECK CMD curl -f http://localhost/health || exit 1
ENTRYPOINT ["dotnet", "Stocker.API.dll"]
EOF
fi

# Manuel Docker build test
echo -e "${YELLOW}Testing Docker build...${NC}"
docker build -f Dockerfile.coolify -t stocker-api-test . || {
    echo -e "${RED}Docker build failed!${NC}"
    echo -e "${YELLOW}Trying simple Dockerfile...${NC}"
    docker build -f Dockerfile.simple -t stocker-api-test .
}

# Eğer build başarılıysa, container'ı çalıştır
if docker images | grep -q stocker-api-test; then
    echo -e "${GREEN}✓ Docker build successful${NC}"
    
    # Eski container'ı durdur
    docker stop stocker-api-coolify 2>/dev/null
    docker rm stocker-api-coolify 2>/dev/null
    
    # Yeni container'ı başlat
    echo -e "${YELLOW}Starting container...${NC}"
    docker run -d \
        --name stocker-api-coolify \
        -p 5104:80 \
        -e ASPNETCORE_ENVIRONMENT=Development \
        -e ConnectionStrings__MasterDb="Host=host.docker.internal;Port=5432;Database=stocker_master;Username=postgres;Password=StockerDb2024!" \
        --restart unless-stopped \
        stocker-api-test
    
    # Test et
    sleep 10
    if curl -f http://localhost:5104/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API is running!${NC}"
        echo -e "${GREEN}Access: http://$(curl -s ifconfig.me):5104/swagger${NC}"
    else
        echo -e "${RED}API health check failed${NC}"
        docker logs stocker-api-coolify --tail 20
    fi
else
    echo -e "${RED}Docker build failed${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Coolify Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "In Coolify Dashboard:"
echo "1. Go to your Application settings"
echo "2. Change Dockerfile path to: Dockerfile.coolify"
echo "3. Or use Build Command instead of Dockerfile:"
echo "   docker build -f Dockerfile.coolify -t myapp ."
echo ""
echo "Alternative: Use Docker Compose in Coolify:"
echo "1. Change Build Pack to 'Docker Compose'"
echo "2. Set file path: deployment/docker-compose.yml"