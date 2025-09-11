using Stocker.SharedKernel.Results;

namespace Stocker.SharedKernel.Exceptions;

/// <summary>
/// Exception for database-related errors
/// </summary>
public class DatabaseException : Exception
{
    public string Code { get; }
    
    public DatabaseException(string message) 
        : base(message)
    {
        Code = "Database.Error";
    }
    
    public DatabaseException(string code, string message) 
        : base(message)
    {
        Code = code;
    }
    
    public DatabaseException(string message, Exception innerException) 
        : base(message, innerException)
    {
        Code = "Database.Error";
    }
    
    public DatabaseException(string code, string message, Exception innerException) 
        : base(message, innerException)
    {
        Code = code;
    }
}