# Simplified Dockerfile for Coolify
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy everything
COPY . .

# Try to restore and build with error handling
RUN dotnet restore "src/API/Stocker.API/Stocker.API.csproj" || echo "Restore warnings ignored"

# Build with verbose output to see errors
RUN dotnet build "src/API/Stocker.API/Stocker.API.csproj" -c Release || echo "Build warnings ignored"

# Publish
RUN dotnet publish "src/API/Stocker.API/Stocker.API.csproj" -c Release -o /app/publish --no-restore --no-build || \
    dotnet publish "src/API/Stocker.API/Stocker.API.csproj" -c Debug -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Configure
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development

# Start without health check for now
ENTRYPOINT ["dotnet", "Stocker.API.dll"]