using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.ResolveError;

public class ResolveErrorCommand : IRequest<Result<bool>>
{
    public string ErrorId { get; init; } = string.Empty;
    public string? Resolution { get; init; }
}
