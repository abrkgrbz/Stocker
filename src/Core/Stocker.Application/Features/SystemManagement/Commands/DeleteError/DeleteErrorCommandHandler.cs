using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.DeleteError;

public class DeleteErrorCommandHandler : IRequestHandler<DeleteErrorCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteErrorCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement actual error deletion from logging system or database
        // For now, return success for UI testing
        return Result<bool>.Success(true);
    }
}
