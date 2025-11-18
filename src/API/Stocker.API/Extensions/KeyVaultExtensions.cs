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
            Console.WriteLine("🔧 Development mode: Skipping Azure Key Vault, using User Secrets");
            return configuration;
        }

        var keyVaultUri = Environment.GetEnvironmentVariable("AZURE_KEY_VAULT_URI");

        if (string.IsNullOrEmpty(keyVaultUri))
        {
            Console.WriteLine("⚠️ AZURE_KEY_VAULT_URI not configured. Using environment variables only.");
            Console.WriteLine("💡 Set AZURE_KEY_VAULT_URI to enable Azure Key Vault integration.");
            return configuration;
        }

        Console.WriteLine($"🔑 Attempting to configure Azure Key Vault: {keyVaultUri}");

        try
        {
            var credential = GetAzureCredential();
            var secretClient = new SecretClient(new Uri(keyVaultUri), credential);

            // Test connection by getting client info (non-blocking)
            Console.WriteLine("🔄 Testing Azure Key Vault connection...");

            configuration.AddAzureKeyVault(secretClient, new AzureKeyVaultConfigurationOptions
            {
                Manager = new CustomKeyVaultSecretManager(),
                ReloadInterval = TimeSpan.FromMinutes(5) // Secrets'ları 5 dakikada bir yenile
            });

            Console.WriteLine($"✅ Azure Key Vault configured successfully: {keyVaultUri}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to configure Azure Key Vault: {ex.GetType().Name}");
            Console.WriteLine($"   Error: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"   Inner: {ex.InnerException.Message}");
            }
            Console.WriteLine("⚠️ Continuing with environment variables only.");
            Console.WriteLine("💡 Check: AZURE_KEY_VAULT_URI, AZURE_TENANT_ID, AZURE_CLIENT_ID");
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
            { "jwt-secret", "JwtSettings:Secret" },
            { "smtp-password", "EmailSettings:SmtpPassword" },
            { "smtp-host", "EmailSettings:SmtpHost" },
            { "smtp-port", "EmailSettings:SmtpPort" },
            { "smtp-username", "EmailSettings:SmtpUsername" },
            { "sa-password", "SA_PASSWORD" },
            { "redis-password", "Redis:Password" },
            { "rabbitmq-password", "RabbitMQ:Password" },
            { "minio-root-password", "Storage:MinIO:RootPassword" },
            { "minio-secret-key", "Storage:MinIO:SecretKey" },
            { "seq-api-key", "Logging:Seq:ApiKey" },
            { "db-password", "DatabasePassword" },
            { "docker-management-ssh-key", "DockerManagement:SshKey" }
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