using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Stocker.Identity.Models;
using Stocker.Identity.Services;
using System.Text;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Settings;

namespace Stocker.Identity.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure JWT Settings
        var jwtSettings = new JwtSettings();
        configuration.Bind("JwtSettings", jwtSettings);
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        // Configure Password Policy
        var passwordPolicy = new PasswordPolicy();
        configuration.Bind("PasswordPolicy", passwordPolicy);
        services.AddSingleton(passwordPolicy);

        // Add Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<Application.Common.Interfaces.IPasswordHasher, PasswordHasher>();
        
        // Register Identity services
        services.AddScoped<Identity.Services.IPasswordValidator, PasswordValidator>();
        services.AddScoped<Identity.Services.IPasswordService, PasswordService>();
        
        // Create wrapper implementations for Application interfaces
        services.AddScoped<Application.Common.Interfaces.IPasswordValidator, ApplicationPasswordValidatorWrapper>();
        services.AddScoped<Application.Common.Interfaces.IPasswordService, ApplicationPasswordServiceWrapper>();
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
                    Console.WriteLine($"JWT Authentication Failed: {context.Exception.Message}");
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Console.WriteLine($"JWT Token Validated Successfully for user: {context.Principal?.Identity?.Name}");
                    // Token doğrulandığında yapılacak işlemler
                    // Örneğin: User bilgilerini cache'e alma
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    Console.WriteLine($"JWT Message Received. Authorization Header: {context.Request.Headers["Authorization"]}");

                    // First try to get token from access_token cookie (httpOnly)
                    var token = context.Request.Cookies["access_token"];

                    // If no access_token cookie, try auth-token for backward compatibility
                    if (string.IsNullOrEmpty(token))
                    {
                        token = context.Request.Cookies["auth-token"];
                    }

                    // If no cookies, try query string (for SignalR)
                    if (string.IsNullOrEmpty(token))
                    {
                        token = context.Request.Query["access_token"];
                    }

                    // If we found a token, use it
                    if (!string.IsNullOrEmpty(token))
                    {
                        context.Token = token;
                        Console.WriteLine($"Token found and set from {(context.Request.Cookies.ContainsKey("access_token") ? "access_token cookie" : context.Request.Cookies.ContainsKey("auth-token") ? "auth-token cookie" : "query string")}");
                    }
                    else
                    {
                        Console.WriteLine("No token found in cookie or query string");
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