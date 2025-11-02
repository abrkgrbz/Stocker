using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Queries.GetSystemErrors;

public record SystemErrorDto
{
    public string Id { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? StackTrace { get; init; }
    public string Source { get; init; } = string.Empty;
    public string Severity { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public bool IsResolved { get; init; }
    public string? Resolution { get; init; }
    public DateTime? ResolvedAt { get; init; }
    public Dictionary<string, object> Metadata { get; init; } = new();
}

public class GetSystemErrorsQuery : IRequest<Result<List<SystemErrorDto>>>
{
    public string? Level { get; init; }
    public string? Source { get; init; }
    public bool? Resolved { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}
