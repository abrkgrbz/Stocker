# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Stocker.sln ./
COPY src/API/Stocker.API/*.csproj ./src/API/Stocker.API/
COPY src/Core/Stocker.Application/*.csproj ./src/Core/Stocker.Application/
COPY src/Core/Stocker.Domain/*.csproj ./src/Core/Stocker.Domain/
COPY src/Core/Stocker.SharedKernel/*.csproj ./src/Core/Stocker.SharedKernel/
COPY src/Infrastructure/Stocker.Infrastructure/*.csproj ./src/Infrastructure/Stocker.Infrastructure/
COPY src/Infrastructure/Stocker.Persistence/*.csproj ./src/Infrastructure/Stocker.Persistence/
COPY src/Infrastructure/Stocker.Identity/*.csproj ./src/Infrastructure/Stocker.Identity/
COPY src/Infrastructure/Stocker.SignalR/*.csproj ./src/Infrastructure/Stocker.SignalR/
COPY src/Modules/Stocker.Modules.CRM/*.csproj ./src/Modules/Stocker.Modules.CRM/
COPY src/Modules/Stocker.Modules.Inventory/*.csproj ./src/Modules/Stocker.Modules.Inventory/
COPY src/Modules/Stocker.Modules.Sales/*.csproj ./src/Modules/Stocker.Modules.Sales/
COPY src/Modules/Stocker.Modules.Purchase/*.csproj ./src/Modules/Stocker.Modules.Purchase/
COPY src/Modules/Stocker.Modules.Finance/*.csproj ./src/Modules/Stocker.Modules.Finance/
COPY src/Modules/Stocker.Modules.HR/*.csproj ./src/Modules/Stocker.Modules.HR/
COPY src/Modules/Stocker.Modules.CMS/*.csproj ./src/Modules/Stocker.Modules.CMS/
COPY src/Modules/Stocker.Modules.Manufacturing/*.csproj ./src/Modules/Stocker.Modules.Manufacturing/
COPY src/Shared/Stocker.Shared.Contracts/*.csproj ./src/Shared/Stocker.Shared.Contracts/
COPY src/Shared/Stocker.Shared.Events/*.csproj ./src/Shared/Stocker.Shared.Events/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY src/ ./src/

# Build and publish
WORKDIR /src
RUN dotnet publish ./src/API/Stocker.API/Stocker.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
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

# Note: Database migrations are handled by the application on startup
# The application loads Azure Key Vault secrets first, then runs migrations
# See: DatabaseMigrationHostedService in MigrationService.cs

# Start the application directly
ENTRYPOINT ["dotnet", "Stocker.API.dll"]
