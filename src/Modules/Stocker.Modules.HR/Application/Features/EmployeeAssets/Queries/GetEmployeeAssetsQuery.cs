using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.EmployeeAssets.Queries;

public record GetEmployeeAssetsQuery() : IRequest<List<EmployeeAssetDto>>;

public class GetEmployeeAssetsQueryHandler : IRequestHandler<GetEmployeeAssetsQuery, List<EmployeeAssetDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeAssetsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<EmployeeAssetDto>> Handle(GetEmployeeAssetsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.EmployeeAssets.GetAllAsync(cancellationToken);
        return entities.Select(entity => new EmployeeAssetDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = entity.Employee?.FullName ?? string.Empty,
            AssetType = entity.AssetType.ToString(),
            Status = entity.Status.ToString(),

            // Asset Information
            AssetName = entity.AssetName,
            AssetCode = entity.AssetCode,
            SerialNumber = entity.SerialNumber,
            Model = entity.Model,
            Brand = entity.Brand,
            Description = entity.Description,

            // Value Information
            PurchaseValue = entity.PurchaseValue,
            CurrentValue = entity.CurrentValue,
            Currency = entity.Currency,
            PurchaseDate = entity.PurchaseDate,
            WarrantyEndDate = entity.WarrantyEndDate,

            // Assignment Information
            AssignmentDate = entity.AssignmentDate,
            ReturnDate = entity.ReturnDate,
            ExpectedReturnDate = entity.ExpectedReturnDate,
            AssignedById = entity.AssignedById,
            AssignedByName = entity.AssignedBy?.FullName,
            ReceivedById = entity.ReceivedById,
            ReceivedByName = entity.ReceivedById != null ? entity.Employee?.FullName : null,

            // Location Information
            Location = entity.Location,
            DepartmentId = entity.DepartmentId,
            DepartmentName = entity.Department?.Name,
            Office = entity.Office,

            // Condition Information
            ConditionAtAssignment = entity.ConditionAtAssignment.ToString(),
            ConditionAtReturn = entity.ConditionAtReturn?.ToString(),
            ConditionNotes = entity.ConditionNotes,
            HasDamage = entity.HasDamage,
            DamageDescription = entity.DamageDescription,
            DamageCost = entity.DamageCost,

            // IT Assets
            IpAddress = entity.IpAddress,
            MacAddress = entity.MacAddress,
            Hostname = entity.Hostname,
            OperatingSystem = entity.OperatingSystem,
            SoftwareLicenses = entity.SoftwareLicenses,

            // Mobile Assets
            Imei = entity.Imei,
            SimCardNumber = entity.SimCardNumber,
            PhoneNumber = entity.PhoneNumber,

            // Vehicle Assets
            LicensePlate = entity.LicensePlate,
            MileageAtAssignment = entity.MileageAtAssignment,
            MileageAtReturn = entity.MileageAtReturn,
            FuelCardNumber = entity.FuelCardNumber,

            // Documents
            AssignmentFormSigned = entity.AssignmentFormSigned,
            AssignmentFormUrl = entity.AssignmentFormUrl,
            ReturnFormUrl = entity.ReturnFormUrl,
            PhotosJson = entity.PhotosJson,

            // Additional Information
            Notes = entity.Notes,
            Tags = entity.Tags,
            InventoryItemId = entity.InventoryItemId,

            IsActive = !entity.IsDeleted,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        }).ToList();
    }
}
