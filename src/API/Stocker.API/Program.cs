using Serilog;
using Stocker.Application;
using Stocker.Identity.Extensions;
using Stocker.Infrastructure.Extensions;
using Stocker.Infrastructure.Middleware;
using Stocker.Persistence.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add User Secrets in Development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug() // Debug seviyesine çektik
    .WriteTo.Console()
    .WriteTo.File("logs/stocker-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    
    // Production için daha güvenli bir policy
    options.AddPolicy("Production",
        policy =>
        {
            policy.WithOrigins("https://yourdomain.com", "http://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // General API
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Stocker API", 
        Version = "v1",
        Description = "Multi-tenant SaaS Inventory Management System API"
    });
    
    // Master API (System Admin)
    c.SwaggerDoc("master", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Stocker Master API", 
        Version = "v1",
        Description = "System Administration API - Requires SystemAdmin role"
    });
    
    // Admin API (Tenant Admin)
    c.SwaggerDoc("admin", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Stocker Admin API", 
        Version = "v1",
        Description = "Tenant Administration API - Requires TenantAdmin role"
    });
    
    // JWT Authentication için Swagger ayarları
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add layer services using extension methods
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMultiTenancy();

// Add Authorization Policies
builder.Services.AddAuthorization(options =>
{
    // System Admin - Full system access
    options.AddPolicy("SystemAdminPolicy", policy =>
        policy.RequireRole("SystemAdmin"));
    
    // Tenant Admin - Tenant-scoped access
    options.AddPolicy("TenantAdminPolicy", policy =>
        policy.RequireRole("TenantAdmin", "SystemAdmin"));
    
    // Regular User
    options.AddPolicy("UserPolicy", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("TenantId"));
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Stocker API v1");
        c.SwaggerEndpoint("/swagger/master/swagger.json", "Master API");
        c.SwaggerEndpoint("/swagger/admin/swagger.json", "Admin API");
    });
}

app.UseHttpsRedirection();

// Use CORS - önemli: UseAuthorization'dan önce olmalı
app.UseCors("AllowAll"); // Development için AllowAll, Production için "Production" policy kullanın

// Add Global Exception Handling Middleware - En başta olmalı
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Add Tenant Resolution Middleware - Authentication'dan önce olmalı
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

 

app.Run();
