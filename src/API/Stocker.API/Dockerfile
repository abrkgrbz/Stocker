# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln ./
COPY src/API/Stocker.API/*.csproj ./src/API/Stocker.API/
COPY src/Core/Stocker.Application/*.csproj ./src/Core/Stocker.Application/
COPY src/Core/Stocker.Domain/*.csproj ./src/Core/Stocker.Domain/
COPY src/Core/Stocker.SharedKernel/*.csproj ./src/Core/Stocker.SharedKernel/
COPY src/Infrastructure/Stocker.Infrastructure/*.csproj ./src/Infrastructure/Stocker.Infrastructure/
COPY src/Infrastructure/Stocker.Persistence/*.csproj ./src/Infrastructure/Stocker.Persistence/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build and publish
WORKDIR /src/src/API/Stocker.API
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published output
COPY --from=build /app/publish .

# Create directory for email templates
RUN mkdir -p /app/EmailTemplates

# Expose port
EXPOSE 5000

# Set environment variable for URLs
ENV ASPNETCORE_URLS=http://+:5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "Stocker.API.dll"]