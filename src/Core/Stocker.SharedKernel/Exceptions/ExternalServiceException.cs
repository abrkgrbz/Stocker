namespace Stocker.SharedKernel.Exceptions;

/// <summary>
/// Exception for external service communication errors
/// </summary>
public class ExternalServiceException : Exception
{
    public string Code { get; }
    public string ServiceName { get; }
    
    public ExternalServiceException(string serviceName, string message) 
        : base(message)
    {
        Code = "ExternalService.Error";
        ServiceName = serviceName;
    }
    
    public ExternalServiceException(string serviceName, string code, string message) 
        : base(message)
    {
        Code = code;
        ServiceName = serviceName;
    }
    
    public ExternalServiceException(string serviceName, string message, Exception innerException) 
        : base(message, innerException)
    {
        Code = "ExternalService.Error";
        ServiceName = serviceName;
    }
}