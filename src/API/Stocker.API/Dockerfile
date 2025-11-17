# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files from repository root
# Context is repository root, so paths are relative to root
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
COPY src/Shared/Stocker.Shared.Contracts/*.csproj ./src/Shared/Stocker.Shared.Contracts/
COPY src/Shared/Stocker.Shared.Events/*.csproj ./src/Shared/Stocker.Shared.Events/

# Restore dependencies
RUN dotnet restore

# Copy all source code - IMPORTANT: Prevents /src/src/ duplication
COPY src/ ./src/

# Install EF Core tools for migration (use specific stable version to avoid corrupted NuGet package)
RUN dotnet tool install --global dotnet-ef --version 9.0.8
ENV PATH="$PATH:/root/.dotnet/tools"

# Build and publish
WORKDIR /src
# Simply publish without warning suppression to avoid syntax issues
RUN dotnet publish ./src/API/Stocker.API/Stocker.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Generate migration bundles (self-contained migration executables)
WORKDIR /src
RUN dotnet ef migrations bundle -p ./src/Infrastructure/Stocker.Persistence -s ./src/API/Stocker.API -c MasterDbContext --self-contained -o /app/efbundle-master || echo "Master migration bundle creation skipped"
RUN dotnet ef migrations bundle -p ./src/Infrastructure/Stocker.Persistence -s ./src/API/Stocker.API -c TenantDbContext --self-contained -o /app/efbundle-tenant || echo "Tenant migration bundle creation skipped"

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published output
COPY --from=build /app/publish .

# Copy migration bundles
COPY --from=build /app/efbundle-master .
COPY --from=build /app/efbundle-tenant .

# Create directory for email templates
RUN mkdir -p /app/EmailTemplates

# Create directory for SSH keys
RUN mkdir -p /app/keys

# Copy SSH key for Docker management (will be provided via build arg or volume mount)
# Note: For production, mount SSH key as volume or use secrets
# COPY ssh_key /app/keys/ssh_key
# RUN chmod 600 /app/keys/ssh_key

# Expose port
EXPOSE 5000

# Set environment variable for URLs
ENV ASPNETCORE_URLS=http://+:5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Create startup script that runs migrations then starts the app
RUN echo '#!/bin/bash\n\
echo "=== Stocker API Startup Script ==="\n\
echo "Setting up environment variables for Coolify..."\n\
echo ""\n\
echo "Environment Check:"\n\
if [ -n "$SA_PASSWORD" ]; then\n\
    echo "  SA_PASSWORD: Set"\n\
else\n\
    echo "  SA_PASSWORD: Not set"\n\
fi\n\
echo "  DB_SERVER: ${DB_SERVER:-Not set}"\n\
if [ -n "$AZURE_KEY_VAULT_URI" ]; then\n\
    echo "  AZURE_KEY_VAULT_URI: $AZURE_KEY_VAULT_URI"\n\
else\n\
    echo "  AZURE_KEY_VAULT_URI: Not set (using env vars)"\n\
fi\n\
echo ""\n\
# Export connection strings if environment variables are present\n\
if [ -n "$SA_PASSWORD" ] && [ -n "$DB_SERVER" ]; then\n\
    export ConnectionStrings__MasterConnection="Server=${DB_SERVER};Database=StockerMasterDb;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    export ConnectionStrings__TenantConnection="Server=${DB_SERVER};Database=StockerTenantDb;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    export ConnectionStrings__DefaultConnection="Server=${DB_SERVER};Database=StockerTenantDb;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    export ConnectionStrings__HangfireConnection="Server=${DB_SERVER};Database=StockerHangfireDb;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    echo "Connection strings constructed from SA_PASSWORD and DB_SERVER"\n\
else\n\
    echo "WARNING: SA_PASSWORD or DB_SERVER not set - will use Azure Key Vault or appsettings"\n\
fi\n\
echo "Running Master database migrations..."\n\
if [ -n "$ConnectionStrings__MasterConnection" ]; then\n\
    echo "Using MasterConnection for Master migrations"\n\
    ./efbundle-master --connection "$ConnectionStrings__MasterConnection"\n\
else\n\
    echo "Building Master connection string from environment variables"\n\
    MASTER_CONNECTION_STRING="Server=${DB_SERVER:-mssql};Database=StockerMasterDb;User Id=sa;Password=${SA_PASSWORD:-YourStrongPassword123!};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    echo "Using constructed connection string for Master migrations"\n\
    ./efbundle-master --connection "$MASTER_CONNECTION_STRING"\n\
fi\n\
MASTER_MIGRATION_EXIT_CODE=$?\n\
if [ $MASTER_MIGRATION_EXIT_CODE -ne 0 ]; then\n\
    echo "Master migration failed with exit code $MASTER_MIGRATION_EXIT_CODE"\n\
    echo "Continuing anyway - database might already be up to date"\n\
fi\n\
echo "Running Tenant database migrations..."\n\
if [ -n "$ConnectionStrings__TenantConnection" ]; then\n\
    echo "Using TenantConnection for Tenant migrations"\n\
    ./efbundle-tenant --connection "$ConnectionStrings__TenantConnection"\n\
else\n\
    echo "Building Tenant connection string from environment variables"\n\
    TENANT_CONNECTION_STRING="Server=${DB_SERVER:-mssql};Database=StockerTenantDb;User Id=sa;Password=${SA_PASSWORD:-YourStrongPassword123!};TrustServerCertificate=true;MultipleActiveResultSets=true"\n\
    echo "Using constructed connection string for Tenant migrations"\n\
    ./efbundle-tenant --connection "$TENANT_CONNECTION_STRING"\n\
fi\n\
TENANT_MIGRATION_EXIT_CODE=$?\n\
if [ $TENANT_MIGRATION_EXIT_CODE -ne 0 ]; then\n\
    echo "Tenant migration failed with exit code $TENANT_MIGRATION_EXIT_CODE"\n\
    echo "Continuing anyway - database might already be up to date"\n\
fi\n\
echo "Starting application..."\n\
exec dotnet Stocker.API.dll' > /app/startup.sh && chmod +x /app/startup.sh

# Start the application with migration
ENTRYPOINT ["/app/startup.sh"]