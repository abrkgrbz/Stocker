using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public class DeleteLoyaltyProgramCommandHandler : IRequestHandler<DeleteLoyaltyProgramCommand, Result<bool>>
{
    private readonly ILoyaltyProgramRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteLoyaltyProgramCommandHandler(
        ILoyaltyProgramRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteLoyaltyProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (program == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyProgram.NotFound", "Loyalty program not found"));

        if (program.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyProgram.Forbidden", "Access denied"));

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
