namespace Stocker.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a requested resource is not found
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.")
    {
        Code = $"{name}.NotFound";
    }

    public string Code { get; } = "NotFound";
}