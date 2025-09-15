namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when there is a conflict with the current state
/// </summary>
public class ConflictException : BusinessException
{
    public ConflictException(string message) : base("CONFLICT", message)
    {
    }

    public ConflictException(string entity, string property, object value)
        : base("CONFLICT", $"{entity} with {property} '{value}' already exists.")
    {
    }
}