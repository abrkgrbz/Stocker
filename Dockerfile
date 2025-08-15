# Root Dockerfile for Coolify - Simplest working version
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy everything at once
COPY . .

# Go to API project and restore
WORKDIR /src/src/API/Stocker.API
RUN dotnet restore

# Try to build and publish
RUN dotnet publish -c Release -o /app/out || dotnet publish -c Debug -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published files
COPY --from=build /app/out .

# Configure
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development

# Run
ENTRYPOINT ["dotnet", "Stocker.API.dll"]