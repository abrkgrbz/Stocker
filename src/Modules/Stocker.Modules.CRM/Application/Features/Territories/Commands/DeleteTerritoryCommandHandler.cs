using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public class DeleteTerritoryCommandHandler : IRequestHandler<DeleteTerritoryCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteTerritoryCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.Territories.GetByIdAsync(request.Id, cancellationToken);

        if (territory == null)
            return Result<bool>.Failure(Error.NotFound("Territory.NotFound", "Territory not found"));

        if (territory.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("Territory.Forbidden", "Access denied"));

        await _unitOfWork.Territories.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
