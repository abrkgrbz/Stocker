using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;

/// <summary>
/// Command to update an employee asset
/// </summary>
public record UpdateEmployeeAssetCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeAssetId { get; init; }
    public AssetAssignmentStatus? Status { get; init; }
    public AssetCondition? ConditionAtReturn { get; init; }
    public string? ConditionNotes { get; init; }
    public bool? HasDamage { get; init; }
    public string? DamageDescription { get; init; }
    public decimal? DamageCost { get; init; }
    public decimal? CurrentValue { get; init; }
    public string? Location { get; init; }
    public int? DepartmentId { get; init; }
    public string? Office { get; init; }
    public string? IpAddress { get; init; }
    public string? MacAddress { get; init; }
    public string? Hostname { get; init; }
    public string? OperatingSystem { get; init; }
    public string? SoftwareLicenses { get; init; }
    public string? PhoneNumber { get; init; }
    public int? MileageAtReturn { get; init; }
    public string? AssignmentFormUrl { get; init; }
    public string? ReturnFormUrl { get; init; }
    public string? PhotosJson { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
}

/// <summary>
/// Handler for UpdateEmployeeAssetCommand
/// </summary>
public class UpdateEmployeeAssetCommandHandler : IRequestHandler<UpdateEmployeeAssetCommand, Result<int>>
{
    private readonly IEmployeeAssetRepository _employeeAssetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEmployeeAssetCommandHandler(
        IEmployeeAssetRepository employeeAssetRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeAssetRepository = employeeAssetRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(UpdateEmployeeAssetCommand request, CancellationToken cancellationToken)
    {
        var employeeAsset = await _employeeAssetRepository.GetByIdAsync(request.EmployeeAssetId, cancellationToken);
        if (employeeAsset == null)
        {
            return Result<int>.Failure(
                Error.NotFound("EmployeeAsset", $"Employee asset with ID {request.EmployeeAssetId} not found"));
        }

        if (request.ConditionAtReturn.HasValue && request.Status == AssetAssignmentStatus.Returned)
        {
            employeeAsset.Return(request.ConditionAtReturn.Value, request.ConditionNotes);
        }

        if (request.Status == AssetAssignmentStatus.Lost)
        {
            employeeAsset.ReportLost();
        }

        if (request.HasDamage == true && !string.IsNullOrEmpty(request.DamageDescription))
        {
            employeeAsset.ReportDamaged(request.DamageDescription, request.DamageCost);
        }

        if (request.Status == AssetAssignmentStatus.Disposed)
        {
            employeeAsset.MarkAsDisposed();
        }

        employeeAsset.SetLocation(request.Location, request.DepartmentId, request.Office);

        if (!string.IsNullOrEmpty(request.IpAddress) || !string.IsNullOrEmpty(request.MacAddress))
        {
            employeeAsset.SetItDetails(
                request.IpAddress,
                request.MacAddress,
                request.Hostname,
                request.OperatingSystem,
                request.SoftwareLicenses);
        }

        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            employeeAsset.SetMobileDetails(null, null, request.PhoneNumber);
        }

        if (request.MileageAtReturn.HasValue)
            employeeAsset.SetMileageAtReturn(request.MileageAtReturn);

        if (!string.IsNullOrEmpty(request.AssignmentFormUrl))
            employeeAsset.SignAssignmentForm(request.AssignmentFormUrl);

        if (!string.IsNullOrEmpty(request.ReturnFormUrl))
            employeeAsset.SetReturnFormUrl(request.ReturnFormUrl);

        if (!string.IsNullOrEmpty(request.PhotosJson))
            employeeAsset.SetPhotos(request.PhotosJson);

        if (!string.IsNullOrEmpty(request.Notes))
            employeeAsset.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Tags))
            employeeAsset.SetTags(request.Tags);

        _employeeAssetRepository.Update(employeeAsset);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeAsset.Id);
    }
}
