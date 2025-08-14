# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["src/API/Stocker.API/Stocker.API.csproj", "API/Stocker.API/"]
COPY ["src/Core/Stocker.Application/Stocker.Application.csproj", "Core/Stocker.Application/"]
COPY ["src/Core/Stocker.Domain/Stocker.Domain.csproj", "Core/Stocker.Domain/"]
COPY ["src/Core/Stocker.SharedKernel/Stocker.SharedKernel.csproj", "Core/Stocker.SharedKernel/"]
COPY ["src/Infrastructure/Stocker.Infrastructure/Stocker.Infrastructure.csproj", "Infrastructure/Stocker.Infrastructure/"]
COPY ["src/Infrastructure/Stocker.Persistence/Stocker.Persistence.csproj", "Infrastructure/Stocker.Persistence/"]
COPY ["src/Infrastructure/Stocker.Identity/Stocker.Identity.csproj", "Infrastructure/Stocker.Identity/"]
COPY ["src/Infrastructure/Stocker.SignalR/Stocker.SignalR.csproj", "Infrastructure/Stocker.SignalR/"]
COPY ["src/Modules/Stocker.Modules.CRM/Stocker.Modules.CRM.csproj", "Modules/Stocker.Modules.CRM/"]

# Restore dependencies
RUN dotnet restore "API/Stocker.API/Stocker.API.csproj"

# Copy everything else
COPY src/ .

# Build the application
WORKDIR "/src/API/Stocker.API"
RUN dotnet build "Stocker.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Stocker.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Create non-root user
RUN useradd -m -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 80
EXPOSE 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "Stocker.API.dll"]