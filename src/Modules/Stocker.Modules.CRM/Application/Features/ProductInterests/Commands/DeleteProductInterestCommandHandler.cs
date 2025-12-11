using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public class DeleteProductInterestCommandHandler : IRequestHandler<DeleteProductInterestCommand, Result<bool>>
{
    private readonly IProductInterestRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteProductInterestCommandHandler(
        IProductInterestRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteProductInterestCommand request, CancellationToken cancellationToken)
    {
        var productInterest = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (productInterest == null)
        {
            return Result<bool>.Failure(Error.NotFound("ProductInterest.NotFound", $"Product interest with ID {request.Id} not found"));
        }

        if (productInterest.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("ProductInterest.Forbidden", "You don't have permission to delete this product interest"));
        }

        await _repository.DeleteAsync(productInterest.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
