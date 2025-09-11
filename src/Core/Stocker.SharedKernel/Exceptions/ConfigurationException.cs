namespace Stocker.SharedKernel.Exceptions;

/// <summary>
/// Exception for configuration-related errors
/// </summary>
public class ConfigurationException : Exception
{
    public string Code { get; }
    
    public ConfigurationException(string message) 
        : base(message)
    {
        Code = "Configuration.Error";
    }
    
    public ConfigurationException(string code, string message) 
        : base(message)
    {
        Code = code;
    }
    
    public ConfigurationException(string message, Exception innerException) 
        : base(message, innerException)
    {
        Code = "Configuration.Error";
    }
}