namespace Stocker.SharedKernel.Results;

public record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null.");

    public static implicit operator string(Error error) => error.Code;

    public static implicit operator Result(Error error) => Result.Failure(error);
}