namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when business rules are violated
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public BusinessException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }

    public string Code { get; }
}