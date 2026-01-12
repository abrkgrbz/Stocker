using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public class DeleteProductInterestCommandHandler : IRequestHandler<DeleteProductInterestCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteProductInterestCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteProductInterestCommand request, CancellationToken cancellationToken)
    {
        var productInterest = await _unitOfWork.ProductInterests.GetByIdAsync(request.Id, cancellationToken);

        if (productInterest == null)
        {
            return Result<bool>.Failure(Error.NotFound("ProductInterest.NotFound", $"Product interest with ID {request.Id} not found"));
        }

        if (productInterest.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("ProductInterest.Forbidden", "You don't have permission to delete this product interest"));
        }

        await _unitOfWork.ProductInterests.DeleteAsync(productInterest.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
