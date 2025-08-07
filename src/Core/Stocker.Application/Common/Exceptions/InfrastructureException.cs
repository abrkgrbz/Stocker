namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when infrastructure issues occur
/// </summary>
public class InfrastructureException : Exception
{
    public InfrastructureException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public InfrastructureException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }

    public string Code { get; }
}