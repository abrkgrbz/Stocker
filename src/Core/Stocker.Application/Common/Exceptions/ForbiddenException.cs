namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when user is forbidden from accessing a resource
/// </summary>
public class ForbiddenException : BusinessException
{
    public ForbiddenException() : base("FORBIDDEN", "Access to this resource is forbidden.")
    {
    }

    public ForbiddenException(string message) : base("FORBIDDEN", message)
    {
    }
}