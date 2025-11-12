using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace Stocker.API.Extensions;

public static class KeyVaultExtensions
{
    public static IConfigurationBuilder AddAzureKeyVault(
        this IConfigurationBuilder configuration,
        IWebHostEnvironment environment)
    {
        // Development'ta User Secrets kullan
        if (environment.IsDevelopment())
        {
            return configuration;
        }

        var keyVaultUri = Environment.GetEnvironmentVariable("AZURE_KEY_VAULT_URI");

        if (string.IsNullOrEmpty(keyVaultUri))
        {
            Console.WriteLine("⚠️ Azure Key Vault URI not configured. Using environment variables.");
            return configuration;
        }

        try
        {
            var credential = GetAzureCredential();
            var secretClient = new SecretClient(new Uri(keyVaultUri), credential);

            configuration.AddAzureKeyVault(secretClient, new AzureKeyVaultConfigurationOptions
            {
                Manager = new CustomKeyVaultSecretManager(),
                ReloadInterval = TimeSpan.FromMinutes(5) // Secrets'ları 5 dakikada bir yenile
            });

            Console.WriteLine($"✅ Azure Key Vault configured: {keyVaultUri}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to configure Azure Key Vault: {ex.Message}");
            Console.WriteLine("⚠️ Falling back to environment variables.");
        }

        return configuration;
    }

    private static DefaultAzureCredential GetAzureCredential()
    {
        return new DefaultAzureCredential(new DefaultAzureCredentialOptions
        {
            // Coolify'da kullanmak için Service Principal credentials
            TenantId = Environment.GetEnvironmentVariable("AZURE_TENANT_ID"),

            // Exclude interactive browser authentication
            ExcludeInteractiveBrowserCredential = true,
            ExcludeVisualStudioCodeCredential = true,
            ExcludeVisualStudioCredential = false, // Local development için

            // Managed Identity for production (if deployed to Azure)
            ManagedIdentityClientId = Environment.GetEnvironmentVariable("AZURE_CLIENT_ID")
        });
    }
}

// Custom KeyVault Secret Manager for naming convention
public class CustomKeyVaultSecretManager : KeyVaultSecretManager
{
    public override Dictionary<string, string> GetData(IEnumerable<KeyVaultSecret> secrets)
    {
        var data = new Dictionary<string, string>();

        foreach (var secret in secrets)
        {
            // Convert Key Vault naming (kebab-case) to .NET configuration format (PascalCase:Nested)
            // Example: "connectionstrings-defaultconnection" -> "ConnectionStrings:DefaultConnection"
            var key = ConvertKeyVaultKeyToConfigKey(secret.Name);
            data[key] = secret.Value;
        }

        return data;
    }

    private string ConvertKeyVaultKeyToConfigKey(string keyVaultKey)
    {
        // Handle special cases
        var replacements = new Dictionary<string, string>
        {
            { "connectionstrings-", "ConnectionStrings:" },
            { "jwt-", "JwtSettings:" },
            { "email-", "EmailSettings:" },
            { "smtp-", "EmailSettings:Smtp" },
            { "minio-", "MinioSettings:" },
            { "rabbitmq-", "RabbitMQ:" },
            { "redis-", "Redis:" }
        };

        var result = keyVaultKey.ToLower();

        foreach (var replacement in replacements)
        {
            if (result.StartsWith(replacement.Key))
            {
                result = result.Replace(replacement.Key, replacement.Value);
                break;
            }
        }

        // Convert remaining dashes to colons for nested configuration
        result = result.Replace("-", ":");

        // Capitalize first letter of each segment
        var segments = result.Split(':');
        for (int i = 0; i < segments.Length; i++)
        {
            if (!string.IsNullOrEmpty(segments[i]))
            {
                segments[i] = char.ToUpper(segments[i][0]) + segments[i].Substring(1);
            }
        }

        return string.Join(":", segments);
    }
}