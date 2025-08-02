using Stocker.SharedKernel.Results;

namespace Stocker.SharedKernel.Exceptions;

public class ValidationException : Exception
{
    public ValidationException(IEnumerable<Error> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors.ToList();
    }

    public ValidationException(string message) : base(message)
    {
        Errors = new List<Error> { new("ValidationError", message) };
    }

    public IReadOnlyList<Error> Errors { get; }
}