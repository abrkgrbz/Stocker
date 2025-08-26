# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln ./
COPY src/API/Stocker.API/*.csproj ./src/API/Stocker.API/
COPY src/Core/Stocker.Application/*.csproj ./src/Core/Stocker.Application/
COPY src/Core/Stocker.Domain/*.csproj ./src/Core/Stocker.Domain/
COPY src/Core/Stocker.SharedKernel/*.csproj ./src/Core/Stocker.SharedKernel/
COPY src/Infrastructure/Stocker.Infrastructure/*.csproj ./src/Infrastructure/Stocker.Infrastructure/
COPY src/Infrastructure/Stocker.Persistence/*.csproj ./src/Infrastructure/Stocker.Persistence/
COPY src/Infrastructure/Stocker.Identity/*.csproj ./src/Infrastructure/Stocker.Identity/
COPY src/Infrastructure/Stocker.SignalR/*.csproj ./src/Infrastructure/Stocker.SignalR/
COPY src/Modules/Stocker.Modules.CRM/*.csproj ./src/Modules/Stocker.Modules.CRM/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Install EF Core tools for migration
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

# Build and publish
WORKDIR /src
RUN dotnet publish src/API/Stocker.API/Stocker.API.csproj -c Release -o /app/publish

# Generate migration bundle (self-contained migration executable)
WORKDIR /src
RUN dotnet ef migrations bundle -p src/Infrastructure/Stocker.Persistence -s src/API/Stocker.API -c MasterDbContext --self-contained -o /app/efbundle

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published output
COPY --from=build /app/publish .

# Copy migration bundle
COPY --from=build /app/efbundle .

# Create directory for email templates
RUN mkdir -p /app/EmailTemplates

# Expose port
EXPOSE 5000

# Set environment variable for URLs
ENV ASPNETCORE_URLS=http://+:5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Create startup script that runs migrations then starts the app
RUN echo '#!/bin/bash\n\
echo "Running database migrations..."\n\
./efbundle --connection "${ConnectionStrings__MasterDatabase}"\n\
echo "Migrations completed. Starting application..."\n\
exec dotnet Stocker.API.dll' > /app/startup.sh && chmod +x /app/startup.sh

# Start the application with migration
ENTRYPOINT ["/app/startup.sh"]