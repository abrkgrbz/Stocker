using Serilog;
using Stocker.Application;
using Stocker.Identity.Extensions;
using Stocker.Infrastructure.Extensions;
using Stocker.Infrastructure.Middleware;
using Stocker.Persistence.Extensions;
using Stocker.Modules.CRM;

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
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5107")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
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
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Stocker.Modules.CRM.CRMModule).Assembly) // CRM Controller'larını yükle
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // General API
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Stocker API", 
        Version = "v1",
        Description = "Multi-tenant SaaS Inventory Management System API",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Stocker Team",
            Email = "support@stocker.com"
        },
        License = new Microsoft.OpenApi.Models.OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
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

    // XML Documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    
    // JWT Authentication için Swagger ayarları
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme.\r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIs...\""
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
            Array.Empty<string>()
        }
    });
});

// Add layer services using extension methods
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMultiTenancy();

// Add CRM Module
builder.Services.AddCRMModule(builder.Configuration);

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
// Swagger'ı hem development hem de production'da kullanılabilir yap
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Stocker API v1");
    c.SwaggerEndpoint("/swagger/master/swagger.json", "Master API");
    c.SwaggerEndpoint("/swagger/admin/swagger.json", "Admin API");
    // RoutePrefix varsayılan olarak "swagger" kullanır
    c.DocumentTitle = "Stocker API Documentation";
    c.EnableDeepLinking();
    c.DisplayRequestDuration();
    c.EnableFilter();
    c.ShowExtensions();
    c.EnableValidator();
    c.DefaultModelsExpandDepth(1);
});

// Add Global Exception Handling Middleware - En başta olmalı
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// HTTPS redirect'i sadece production'da kullan
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Use CORS - Authentication'dan önce olmalı
app.UseCors("AllowAll"); // Development için AllowAll, Production için "Production" policy kullanın

// Add Tenant Resolution Middleware - Authentication'dan önce olmalı
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

 

app.Run();
