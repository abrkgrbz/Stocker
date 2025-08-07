namespace Stocker.SharedKernel.Results;

public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
        {
            throw new InvalidOperationException("Cannot have error when success.");
        }

        if (!isSuccess && error == Error.None)
        {
            throw new InvalidOperationException("Must have error when failure.");
        }

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Success() => new(true, Error.None);
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<TValue> Failure<TValue>(Error error) => new(default!, false, error);

    public static Result Create(bool condition, Error error) =>
        condition ? Success() : Failure(error);

    public static Result<TValue> Create<TValue>(TValue? value, Error error) where TValue : class =>
        value is not null ? Success(value) : Failure<TValue>(error);
}

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, Error error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access value on failure result.");

    public static Result<TValue> Success(TValue value) => new(value, true, Error.None);
    public static new Result<TValue> Failure(Error error) => new(default!, false, error);

    public static implicit operator Result<TValue>(TValue? value) =>
        value is not null ? Success(value) : Failure(Error.NullValue);
}