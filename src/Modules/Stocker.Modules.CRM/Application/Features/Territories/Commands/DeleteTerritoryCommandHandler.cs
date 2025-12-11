using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.Territories.Commands;

public class DeleteTerritoryCommandHandler : IRequestHandler<DeleteTerritoryCommand, Result<bool>>
{
    private readonly ITerritoryRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteTerritoryCommandHandler(
        ITerritoryRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (territory == null)
            return Result<bool>.Failure(Error.NotFound("Territory.NotFound", "Territory not found"));

        if (territory.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("Territory.Forbidden", "Access denied"));

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
