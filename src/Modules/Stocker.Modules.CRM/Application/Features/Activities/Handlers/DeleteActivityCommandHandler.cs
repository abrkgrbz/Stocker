using MediatR;
using Stocker.Modules.CRM.Application.Features.Activities.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Handlers;

public class DeleteActivityCommandHandler : IRequestHandler<DeleteActivityCommand, Result>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteActivityCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteActivityCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement activity deletion logic
        // This is a placeholder implementation until Activity entity and repository are created
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}