using System.Text.Encodings.Web;
using Microsoft.OpenApi.Models;
using Stocker.API.Configuration;
using Stocker.API.Filters;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring Swagger/OpenAPI documentation
/// </summary>
public static class SwaggerExtensions
{
    /// <summary>
    /// Adds Swagger documentation with multiple API groups and JWT security
    /// </summary>
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            // Master API - System management endpoints
            c.SwaggerDoc("master", new OpenApiInfo
            {
                Title = "Stocker Master API",
                Version = "v1",
                Description = "Master panel API for system-wide tenant management and configuration",
                Contact = new OpenApiContact
                {
                    Name = "Stocker API Support",
                    Email = "support@stoocker.app"
                }
            });

            // Tenant API - Tenant-scoped operations
            c.SwaggerDoc("tenant", new OpenApiInfo
            {
                Title = "Stocker Tenant API",
                Version = "v1",
                Description = "Tenant-specific API for business operations (inventory, orders, customers)"
            });

            // CRM Module API
            c.SwaggerDoc("crm", new OpenApiInfo
            {
                Title = "Stocker CRM Module",
                Version = "v1",
                Description = "CRM module for customer relationship management"
            });

            // Public API - No authentication required
            c.SwaggerDoc("public", new OpenApiInfo
            {
                Title = "Stocker Public API",
                Version = "v1",
                Description = "Public endpoints (registration, health checks, etc.)"
            });

            // Admin API - Administrative operations
            c.SwaggerDoc("admin", new OpenApiInfo
            {
                Title = "Stocker Admin API",
                Version = "v1",
                Description = "Administrative endpoints for system configuration"
            });

            // JWT Security scheme
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization header using the Bearer scheme. Enter your token in the text input below.",
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            };

            c.AddSecurityDefinition("Bearer", securityScheme);

            var securityRequirement = new OpenApiSecurityRequirement
            {
                { securityScheme, Array.Empty<string>() }
            };

            c.AddSecurityRequirement(securityRequirement);

            // Use custom schema IDs for cleaner documentation
            c.CustomSchemaIds(type =>
            {
                var typeName = type.Name;

                // Handle namespace conflicts for duplicate class names
                if (typeName == "TopTenantDto" || typeName == "TenantsStatisticsDto")
                {
                    var namespaceParts = type.Namespace?.Split('.') ?? Array.Empty<string>();
                    if (namespaceParts.Length > 0)
                    {
                        var lastPart = namespaceParts[^1];
                        typeName = $"{lastPart}_{typeName}";
                    }
                }

                // Handle generic types with full type information
                if (type.IsGenericType)
                {
                    var genericTypeName = type.GetGenericTypeDefinition().Name;
                    if (genericTypeName.Contains('`'))
                    {
                        genericTypeName = genericTypeName.Substring(0, genericTypeName.IndexOf('`'));
                    }

                    var genericArgs = type.GetGenericArguments();
                    var genericArgNames = new List<string>();

                    foreach (var arg in genericArgs)
                    {
                        if (arg.IsGenericType)
                        {
                            var nestedName = arg.GetGenericTypeDefinition().Name;
                            if (nestedName.Contains('`'))
                            {
                                nestedName = nestedName.Substring(0, nestedName.IndexOf('`'));
                            }
                            var nestedArgs = arg.GetGenericArguments();
                            var nestedArgNames = nestedArgs.Select(a => a.Name.Replace("Dto", ""));
                            genericArgNames.Add($"{nestedName}Of{string.Join("And", nestedArgNames)}");
                        }
                        else
                        {
                            var argName = arg.Name.Replace("Dto", "").Replace("ViewModel", "VM");
                            genericArgNames.Add(argName);
                        }
                    }

                    typeName = $"{genericTypeName}Of{string.Join("_", genericArgNames)}";
                }

                // Add namespace prefix for duplicate class names
                var duplicateNames = new[]
                {
                    "ProcessPaymentCommand",
                    "ProcessPaymentResult",
                    "PaymentResultDto",
                    "CreateInvoiceCommand",
                    "UpdateInvoiceCommand",
                    "ApiResponse",
                    "PagedResult"
                };

                var baseTypeName = typeName.Contains("Of") ? typeName.Substring(0, typeName.IndexOf("Of")) : typeName;

                if (duplicateNames.Contains(baseTypeName))
                {
                    var namespaceParts = type.Namespace?.Split('.') ?? Array.Empty<string>();
                    if (namespaceParts.Length > 0)
                    {
                        var context = namespaceParts[^1];
                        if (context == "ProcessPayment" || context == "Commands" || context == "Queries")
                        {
                            context = namespaceParts.Length > 1 ? namespaceParts[^2] : context;
                        }

                        if (!typeName.StartsWith(context))
                        {
                            typeName = $"{context}_{typeName}";
                        }
                    }
                }

                // Clean up common suffixes for better readability
                if (!type.IsGenericType)
                {
                    var cleanupSuffixes = new Dictionary<string, string>
                    {
                        { "Dto", "" },
                        { "ViewModel", "VM" },
                        { "Request", "Req" },
                        { "Response", "Res" },
                        { "Command", "Cmd" },
                        { "Query", "Qry" }
                    };

                    foreach (var suffix in cleanupSuffixes)
                    {
                        if (typeName.EndsWith(suffix.Key) && typeName.Length > suffix.Key.Length)
                        {
                            typeName = typeName.Substring(0, typeName.Length - suffix.Key.Length) + suffix.Value;
                            break;
                        }
                    }
                }

                return typeName;
            });

            // Enable annotations
            c.EnableAnnotations();

            // Include XML comments for better documentation
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                c.IncludeXmlComments(xmlPath);
            }

            // Include CRM module XML comments
            var crmXmlFile = "Stocker.Modules.CRM.xml";
            var crmXmlPath = Path.Combine(AppContext.BaseDirectory, crmXmlFile);
            if (File.Exists(crmXmlPath))
            {
                c.IncludeXmlComments(crmXmlPath);
            }

            // Add schema filter to clean up schema display
            c.SchemaFilter<CleanupSchemaFilter>();

            // Group endpoints by path
            c.DocInclusionPredicate((docName, apiDesc) =>
            {
                var path = apiDesc.RelativePath?.ToLower() ?? "";

                return docName switch
                {
                    "master" => path.Contains("/master/"),
                    "tenant" => path.Contains("/tenant/"),
                    "crm" => path.Contains("/crm/"),
                    "public" => path.Contains("/public/") || path.Contains("/auth"),
                    "admin" => path.Contains("/admin/"),
                    _ => false
                };
            });

            // Add operation filter to conditionally apply security requirements
            c.OperationFilter<AuthorizeCheckOperationFilter>();
        });

        return services;
    }
}
