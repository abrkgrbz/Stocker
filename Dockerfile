# Multi-stage build for .NET 8 API
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY Stocker.sln ./

# Copy all project files for restore
COPY src/API/Stocker.API/*.csproj ./src/API/Stocker.API/
COPY src/Core/Stocker.Application/*.csproj ./src/Core/Stocker.Application/
COPY src/Core/Stocker.Domain/*.csproj ./src/Core/Stocker.Domain/
COPY src/Core/Stocker.SharedKernel/*.csproj ./src/Core/Stocker.SharedKernel/
COPY src/Infrastructure/Stocker.Identity/*.csproj ./src/Infrastructure/Stocker.Identity/
COPY src/Infrastructure/Stocker.Infrastructure/*.csproj ./src/Infrastructure/Stocker.Infrastructure/
COPY src/Infrastructure/Stocker.Persistence/*.csproj ./src/Infrastructure/Stocker.Persistence/
COPY src/Infrastructure/Stocker.SignalR/*.csproj ./src/Infrastructure/Stocker.SignalR/
COPY src/Modules/Stocker.Modules.CRM/*.csproj ./src/Modules/Stocker.Modules.CRM/

# Restore dependencies
RUN dotnet restore "src/API/Stocker.API/Stocker.API.csproj"

# Copy everything
COPY . .

# Build
WORKDIR /src/src/API/Stocker.API
RUN dotnet build "Stocker.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Stocker.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create directories for logs and emails
RUN mkdir -p /app/logs /app/emails && \
    chmod 755 /app/logs /app/emails

# Copy published files
COPY --from=publish /app/publish .

# Set environment to Production by default
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "Stocker.API.dll"]