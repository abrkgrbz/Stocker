using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public class DeleteLoyaltyProgramCommandHandler : IRequestHandler<DeleteLoyaltyProgramCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteLoyaltyProgramCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteLoyaltyProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _unitOfWork.LoyaltyPrograms.GetByIdAsync(request.Id, cancellationToken);

        if (program == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyProgram.NotFound", "Loyalty program not found"));

        if (program.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyProgram.Forbidden", "Access denied"));

        await _unitOfWork.LoyaltyPrograms.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
