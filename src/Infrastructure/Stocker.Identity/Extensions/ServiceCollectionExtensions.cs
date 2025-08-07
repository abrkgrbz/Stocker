using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Stocker.Identity.Models;
using Stocker.Identity.Services;
using System.Text;

namespace Stocker.Identity.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure JWT Settings
        var jwtSettings = new JwtSettings();
        configuration.Bind("JwtSettings", jwtSettings);
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        // Add Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<ITokenGenerationService, TokenGenerationService>();
        services.AddScoped<IAuthenticationService, RefactoredAuthenticationService>();

        // Configure JWT Authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = false; // Development için, production'da true olmalı
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ClockSkew = TimeSpan.Zero
            };

            // JWT Events (logging, debugging için)
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    // Token doğrulandığında yapılacak işlemler
                    // Örneğin: User bilgilerini cache'e alma
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    // SignalR için token'ı query string'den alma
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    
                    return Task.CompletedTask;
                }
            };
        });

        // Add Authorization Policies
        services.AddAuthorization(options =>
        {
            // Master User Policy
            options.AddPolicy("MasterUserOnly", policy =>
                policy.RequireClaim("IsMasterUser", "true"));

            // Tenant User Policy
            options.AddPolicy("TenantUserOnly", policy =>
                policy.RequireClaim("TenantId"));

            // System Admin Policy
            options.AddPolicy("SystemAdminOnly", policy =>
                policy.RequireRole("SystemAdmin"));

            // Tenant Admin Policy
            options.AddPolicy("TenantAdminOnly", policy =>
                policy.RequireRole("TenantAdmin"));

            // Multi-tenant aware policy
            options.AddPolicy("RequireTenant", policy =>
                policy.RequireAssertion(context =>
                    context.User.HasClaim(c => c.Type == "TenantId")));
        });

        return services;
    }
}