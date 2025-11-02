using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.ClearResolvedErrors;

public class ClearResolvedErrorsCommandHandler : IRequestHandler<ClearResolvedErrorsCommand, Result<int>>
{
    public async Task<Result<int>> Handle(ClearResolvedErrorsCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement actual deletion of resolved errors from logging system or database
        // For now, return mock count for UI testing
        return Result<int>.Success(15);
    }
}
