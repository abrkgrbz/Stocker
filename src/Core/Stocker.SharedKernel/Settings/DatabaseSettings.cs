namespace Stocker.SharedKernel.Settings;

public class DatabaseSettings
{
    public string ServerName { get; set; } = string.Empty;
    public string MasterDatabaseName { get; set; } = "StockerMasterDb";
    public bool UseWindowsAuthentication { get; set; } = true;
    public string? UserId { get; set; }
    public string? Password { get; set; }
    public int CommandTimeout { get; set; } = 30;
    public bool EnableSensitiveDataLogging { get; set; } = false;
    public bool EnableDetailedErrors { get; set; } = false;
    
    public string GetMasterConnectionString()
    {
        var builder = new System.Text.StringBuilder();
        builder.Append($"Server={ServerName};");
        builder.Append($"Database={MasterDatabaseName};");
        
        if (UseWindowsAuthentication)
        {
            builder.Append("Trusted_Connection=True;");
        }
        else
        {
            builder.Append($"User Id={UserId};");
            builder.Append($"Password={Password};");
        }
        
        builder.Append("MultipleActiveResultSets=true;");
        builder.Append("TrustServerCertificate=True;");
        
        return builder.ToString();
    }
    
    public string GetTenantConnectionString(string tenantCode)
    {
        var builder = new System.Text.StringBuilder();
        builder.Append($"Server={ServerName};");
        builder.Append($"Database=Stocker_{tenantCode}_Db;");
        
        if (UseWindowsAuthentication)
        {
            builder.Append("Trusted_Connection=True;");
        }
        else
        {
            builder.Append($"User Id={UserId};");
            builder.Append($"Password={Password};");
        }
        
        builder.Append("MultipleActiveResultSets=true;");
        builder.Append("TrustServerCertificate=True;");
        
        return builder.ToString();
    }
}