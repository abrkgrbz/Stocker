namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when user doesn't have permission to access a resource
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public ForbiddenAccessException()
        : base("Access is forbidden.")
    {
        Code = "Forbidden";
    }

    public ForbiddenAccessException(string message)
        : base(message)
    {
        Code = "Forbidden";
    }

    public string Code { get; }
}