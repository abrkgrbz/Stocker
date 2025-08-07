namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when user is not authenticated
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public UnauthorizedException()
        : base("Unauthorized access.")
    {
        Code = "Unauthorized";
    }

    public UnauthorizedException(string message)
        : base(message)
    {
        Code = "Unauthorized";
    }

    public string Code { get; }
}