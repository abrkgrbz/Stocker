using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;

/// <summary>
/// Command to delete an employee asset
/// </summary>
public record DeleteEmployeeAssetCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int EmployeeAssetId { get; init; }
}

/// <summary>
/// Handler for DeleteEmployeeAssetCommand
/// </summary>
public class DeleteEmployeeAssetCommandHandler : IRequestHandler<DeleteEmployeeAssetCommand, Result<bool>>
{
    private readonly IEmployeeAssetRepository _employeeAssetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEmployeeAssetCommandHandler(
        IEmployeeAssetRepository employeeAssetRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeAssetRepository = employeeAssetRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteEmployeeAssetCommand request, CancellationToken cancellationToken)
    {
        var employeeAsset = await _employeeAssetRepository.GetByIdAsync(request.EmployeeAssetId, cancellationToken);
        if (employeeAsset == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeAsset", $"Employee asset with ID {request.EmployeeAssetId} not found"));
        }

        _employeeAssetRepository.Remove(employeeAsset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
