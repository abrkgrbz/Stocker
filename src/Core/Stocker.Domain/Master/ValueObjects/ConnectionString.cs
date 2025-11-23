using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class ConnectionString : ValueObject
{
    public string Value { get; private set; }

    // EF Core constructor
    private ConnectionString()
    {
        Value = string.Empty;
    }

    private ConnectionString(string value)
    {
        Value = value;
    }

    public static Result<ConnectionString> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<ConnectionString>.Failure(new Error("ConnectionString.Empty", "Connection string cannot be empty.", ErrorType.Validation));
        }

        // Basic validation - check for required components
        var hasServerInfo = value.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
                           value.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) ||
                           value.Contains("Host=", StringComparison.OrdinalIgnoreCase); // PostgreSQL format

        if (!hasServerInfo)
        {
            return Result<ConnectionString>.Failure(new Error("ConnectionString.NoServer", "Connection string must contain server information.", ErrorType.Validation));
        }

        // SQLite uses Data Source without Database field
        var isSqlite = value.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) && 
                      (value.Contains(".db", StringComparison.OrdinalIgnoreCase) || 
                       value.Contains(".sqlite", StringComparison.OrdinalIgnoreCase) ||
                       value.Contains(":memory:", StringComparison.OrdinalIgnoreCase));
        
        if (!isSqlite)
        {
            var hasDatabaseInfo = value.Contains("Database=", StringComparison.OrdinalIgnoreCase) ||
                                 value.Contains("Initial Catalog=", StringComparison.OrdinalIgnoreCase);
            
            if (!hasDatabaseInfo)
            {
                return Result<ConnectionString>.Failure(new Error("ConnectionString.NoDatabase", "Connection string must contain database information.", ErrorType.Validation));
            }
        }

        return Result<ConnectionString>.Success(new ConnectionString(value));
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => "***Connection String***"; // Security - don't expose in logs
}