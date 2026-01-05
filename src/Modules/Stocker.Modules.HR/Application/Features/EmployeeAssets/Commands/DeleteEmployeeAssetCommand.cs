using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;

/// <summary>
/// Command to delete an employee asset
/// </summary>
public record DeleteEmployeeAssetCommand : IRequest<Result<bool>>
{
    public int EmployeeAssetId { get; init; }
}

/// <summary>
/// Handler for DeleteEmployeeAssetCommand
/// </summary>
public class DeleteEmployeeAssetCommandHandler : IRequestHandler<DeleteEmployeeAssetCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteEmployeeAssetCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteEmployeeAssetCommand request, CancellationToken cancellationToken)
    {
        var employeeAsset = await _unitOfWork.EmployeeAssets.GetByIdAsync(request.EmployeeAssetId, cancellationToken);
        if (employeeAsset == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeAsset", $"Employee asset with ID {request.EmployeeAssetId} not found"));
        }

        _unitOfWork.EmployeeAssets.Remove(employeeAsset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
