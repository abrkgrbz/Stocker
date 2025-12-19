using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Stocker.Identity.Logging;
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

        // Core Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<Application.Common.Interfaces.IPasswordHasher, PasswordHasher>();

        // Password Validator - single implementation for both interfaces
        services.AddScoped<PasswordValidator>();
        services.AddScoped<Identity.Services.IPasswordValidator>(sp => sp.GetRequiredService<PasswordValidator>());
        services.AddScoped<Application.Common.Interfaces.IPasswordValidator>(sp => sp.GetRequiredService<PasswordValidator>());

        // Password Service - single implementation for both interfaces
        services.AddScoped<PasswordService>();
        services.AddScoped<Identity.Services.IPasswordService>(sp => sp.GetRequiredService<PasswordService>());
        services.AddScoped<Application.Common.Interfaces.IPasswordService>(sp => sp.GetRequiredService<PasswordService>());

        // User Management and Token Services
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<ITokenGenerationService, TokenGenerationService>();

        // Authentication Service
        services.AddScoped<IAuthenticationService, AuthenticationService>();

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

            // JWT Events with proper structured logging
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetService<ILogger<JwtBearerEvents>>();
                    logger?.LogWarning(
                        new EventId(IdentityLogEvents.TokenValidationFailed, nameof(IdentityLogEvents.TokenValidationFailed)),
                        context.Exception,
                        "JWT authentication failed");

                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetService<ILogger<JwtBearerEvents>>();
                    logger?.LogDebug(
                        new EventId(IdentityLogEvents.JwtTokenValidated, nameof(IdentityLogEvents.JwtTokenValidated)),
                        "JWT token validated for user: {UserName}",
                        context.Principal?.Identity?.Name ?? "unknown");
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetService<ILogger<JwtBearerEvents>>();

                    // First try to get token from access_token cookie (httpOnly)
                    var token = context.Request.Cookies["access_token"];
                    var tokenSource = "access_token cookie";

                    // If no access_token cookie, try auth-token for backward compatibility
                    if (string.IsNullOrEmpty(token))
                    {
                        token = context.Request.Cookies["auth-token"];
                        tokenSource = "auth-token cookie";
                    }

                    // If no cookies, try query string (for SignalR)
                    if (string.IsNullOrEmpty(token))
                    {
                        token = context.Request.Query["access_token"];
                        tokenSource = "query string";
                    }

                    // If we found a token, use it
                    if (!string.IsNullOrEmpty(token))
                    {
                        context.Token = token;
                        logger?.LogDebug(
                            new EventId(IdentityLogEvents.JwtMessageReceived, nameof(IdentityLogEvents.JwtMessageReceived)),
                            "JWT token resolved from {TokenSource}",
                            tokenSource);
                    }
                    else
                    {
                        logger?.LogDebug(
                            new EventId(IdentityLogEvents.JwtMessageReceived, nameof(IdentityLogEvents.JwtMessageReceived)),
                            "No JWT token found in request");
                    }

                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetService<ILogger<JwtBearerEvents>>();
                    logger?.LogDebug(
                        new EventId(IdentityLogEvents.JwtChallenge, nameof(IdentityLogEvents.JwtChallenge)),
                        "JWT challenge issued: {Error} - {ErrorDescription}",
                        context.Error ?? "none",
                        context.ErrorDescription ?? "none");
                    return Task.CompletedTask;
                },
                OnForbidden = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetService<ILogger<JwtBearerEvents>>();
                    logger?.LogWarning(
                        new EventId(IdentityLogEvents.JwtForbidden, nameof(IdentityLogEvents.JwtForbidden)),
                        "JWT forbidden response for path: {Path}",
                        context.HttpContext.Request.Path);
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