using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeAssets.Commands;

/// <summary>
/// Command to create a new employee asset
/// </summary>
public record CreateEmployeeAssetCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeId { get; init; }
    public AssetType AssetType { get; init; }
    public string AssetName { get; init; } = string.Empty;
    public AssetCondition ConditionAtAssignment { get; init; }
    public string? AssetCode { get; init; }
    public string? SerialNumber { get; init; }
    public string? Model { get; init; }
    public string? Brand { get; init; }
    public string? Description { get; init; }
    public decimal? PurchaseValue { get; init; }
    public decimal? CurrentValue { get; init; }
    public DateTime? PurchaseDate { get; init; }
    public DateTime? WarrantyEndDate { get; init; }
    public int? AssignedById { get; init; }
    public DateTime? ExpectedReturnDate { get; init; }
    public string? Location { get; init; }
    public int? DepartmentId { get; init; }
    public string? Office { get; init; }
    public string? IpAddress { get; init; }
    public string? MacAddress { get; init; }
    public string? Hostname { get; init; }
    public string? OperatingSystem { get; init; }
    public string? SoftwareLicenses { get; init; }
    public string? Imei { get; init; }
    public string? SimCardNumber { get; init; }
    public string? PhoneNumber { get; init; }
    public string? LicensePlate { get; init; }
    public int? MileageAtAssignment { get; init; }
    public string? FuelCardNumber { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
    public int? InventoryItemId { get; init; }
}

/// <summary>
/// Handler for CreateEmployeeAssetCommand
/// </summary>
public class CreateEmployeeAssetCommandHandler : IRequestHandler<CreateEmployeeAssetCommand, Result<int>>
{
    private readonly IEmployeeAssetRepository _employeeAssetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEmployeeAssetCommandHandler(
        IEmployeeAssetRepository employeeAssetRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeAssetRepository = employeeAssetRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateEmployeeAssetCommand request, CancellationToken cancellationToken)
    {
        var employeeAsset = new EmployeeAsset(
            request.EmployeeId,
            request.AssetType,
            request.AssetName,
            request.ConditionAtAssignment);

        employeeAsset.SetTenantId(request.TenantId);

        employeeAsset.SetAssetDetails(request.AssetCode, request.SerialNumber, request.Model, request.Brand);

        if (!string.IsNullOrEmpty(request.Description))
            employeeAsset.SetDescription(request.Description);

        employeeAsset.SetValueInfo(
            request.PurchaseValue,
            request.CurrentValue,
            request.PurchaseDate,
            request.WarrantyEndDate);

        if (request.AssignedById.HasValue)
            employeeAsset.SetAssignedBy(request.AssignedById);

        if (request.ExpectedReturnDate.HasValue)
            employeeAsset.SetExpectedReturnDate(request.ExpectedReturnDate);

        employeeAsset.SetLocation(request.Location, request.DepartmentId, request.Office);

        // IT Assets
        if (request.AssetType == AssetType.Laptop || request.AssetType == AssetType.Desktop)
        {
            employeeAsset.SetItDetails(
                request.IpAddress,
                request.MacAddress,
                request.Hostname,
                request.OperatingSystem,
                request.SoftwareLicenses);
        }

        // Mobile Assets
        if (request.AssetType == AssetType.MobilePhone || request.AssetType == AssetType.Tablet)
        {
            employeeAsset.SetMobileDetails(request.Imei, request.SimCardNumber, request.PhoneNumber);
        }

        // Vehicle Assets
        if (request.AssetType == AssetType.Vehicle)
        {
            employeeAsset.SetVehicleDetails(request.LicensePlate, request.MileageAtAssignment, request.FuelCardNumber);
        }

        if (!string.IsNullOrEmpty(request.Notes))
            employeeAsset.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Tags))
            employeeAsset.SetTags(request.Tags);

        if (request.InventoryItemId.HasValue)
            employeeAsset.SetInventoryItemId(request.InventoryItemId);

        await _employeeAssetRepository.AddAsync(employeeAsset, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeAsset.Id);
    }
}
