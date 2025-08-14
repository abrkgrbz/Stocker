using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Stocker.API.Filters;

/// <summary>
/// Cleans up schema definitions for better readability in Swagger UI
/// </summary>
public class CleanupSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties == null) return;

        // Clean up property names and add descriptions
        var propertiesToClean = new Dictionary<string, string>
        {
            // Common property descriptions
            { "id", "Unique identifier" },
            { "createdAt", "Creation timestamp" },
            { "createdDate", "Creation date" },
            { "updatedAt", "Last update timestamp" },
            { "modifiedDate", "Last modification date" },
            { "isActive", "Indicates if the entity is active" },
            { "isDeleted", "Soft delete flag" },
            { "tenantId", "Tenant identifier for multi-tenancy" },
            { "userId", "User identifier" },
            { "email", "Email address" },
            { "phoneNumber", "Contact phone number" },
            { "password", "User password (will be hashed)" },
            { "token", "Authentication token" },
            { "refreshToken", "Token for refreshing authentication" },
            { "expiresIn", "Token expiration time in seconds" }
        };

        foreach (var property in schema.Properties)
        {
            var propertyName = property.Key.ToLowerInvariant();
            
            // Add description if missing
            if (string.IsNullOrWhiteSpace(property.Value.Description))
            {
                foreach (var desc in propertiesToClean)
                {
                    if (propertyName == desc.Key.ToLowerInvariant())
                    {
                        property.Value.Description = desc.Value;
                        break;
                    }
                }
            }

            // Mark sensitive fields
            var sensitiveFields = new[] { "password", "token", "refreshtoken", "apikey", "secret" };
            if (sensitiveFields.Any(f => propertyName.Contains(f)))
            {
                property.Value.Format = "password";
            }

            // Set format for common types
            if (propertyName.Contains("email"))
            {
                property.Value.Format = "email";
            }
            else if (propertyName.Contains("url") || propertyName.Contains("uri"))
            {
                property.Value.Format = "uri";
            }
            else if (propertyName.Contains("date") && !propertyName.Contains("update"))
            {
                property.Value.Format = "date";
            }
            else if (propertyName.Contains("time") || propertyName.Contains("at"))
            {
                property.Value.Format = "date-time";
            }
            else if (propertyName.Contains("phone"))
            {
                property.Value.Pattern = @"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$";
                property.Value.Description = property.Value.Description ?? "Phone number in international format";
            }
        }

        // Add example values for better understanding
        if (context.Type.Name.EndsWith("Request") || context.Type.Name.EndsWith("Command"))
        {
            AddExampleValues(schema, context.Type);
        }

        // Remove internal properties from display
        var internalProperties = new[] { "discriminator", "$type", "stackTrace", "innerException" };
        foreach (var internalProp in internalProperties)
        {
            if (schema.Properties.ContainsKey(internalProp))
            {
                schema.Properties.Remove(internalProp);
            }
        }
    }

    private void AddExampleValues(OpenApiSchema schema, Type type)
    {
        // Add example based on type name
        if (type.Name.Contains("Login"))
        {
            schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
            {
                ["email"] = new Microsoft.OpenApi.Any.OpenApiString("admin@example.com"),
                ["password"] = new Microsoft.OpenApi.Any.OpenApiString("SecurePassword123!")
            };
        }
        else if (type.Name.Contains("Register"))
        {
            schema.Example = new Microsoft.OpenApi.Any.OpenApiObject
            {
                ["companyName"] = new Microsoft.OpenApi.Any.OpenApiString("Acme Corporation"),
                ["email"] = new Microsoft.OpenApi.Any.OpenApiString("admin@acme.com"),
                ["password"] = new Microsoft.OpenApi.Any.OpenApiString("SecurePassword123!"),
                ["firstName"] = new Microsoft.OpenApi.Any.OpenApiString("John"),
                ["lastName"] = new Microsoft.OpenApi.Any.OpenApiString("Doe"),
                ["packageId"] = new Microsoft.OpenApi.Any.OpenApiString("starter-package")
            };
        }
    }
}