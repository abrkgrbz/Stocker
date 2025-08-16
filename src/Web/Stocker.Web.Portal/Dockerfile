# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Stocker.Web.Portal.csproj", "./"]
RUN dotnet restore "Stocker.Web.Portal.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Stocker.Web.Portal.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Stocker.Web.Portal.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published files
COPY --from=publish /app/publish .

# Set environment variable for URLs
ENV ASPNETCORE_URLS=http://+:80

# Start the application
ENTRYPOINT ["dotnet", "Stocker.Web.Portal.dll"]