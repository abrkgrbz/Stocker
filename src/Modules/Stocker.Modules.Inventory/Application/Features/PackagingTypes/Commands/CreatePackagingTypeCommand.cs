using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PackagingTypes.Commands;

/// <summary>
/// Command to create a new packaging type
/// </summary>
public class CreatePackagingTypeCommand : IRequest<Result<PackagingTypeDto>>
{
    public Guid TenantId { get; set; }
    public CreatePackagingTypeDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreatePackagingTypeCommand
/// </summary>
public class CreatePackagingTypeCommandValidator : AbstractValidator<CreatePackagingTypeCommand>
{
    public CreatePackagingTypeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Category).NotEmpty();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.MaterialType).MaximumLength(100);
        RuleFor(x => x.Data.BarcodePrefix).MaximumLength(20);
    }
}

/// <summary>
/// Handler for CreatePackagingTypeCommand
/// </summary>
public class CreatePackagingTypeCommandHandler : IRequestHandler<CreatePackagingTypeCommand, Result<PackagingTypeDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreatePackagingTypeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PackagingTypeDto>> Handle(CreatePackagingTypeCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check if code already exists
        var existingPackaging = await _unitOfWork.PackagingTypes.GetByCodeAsync(data.Code, cancellationToken);
        if (existingPackaging != null)
        {
            return Result<PackagingTypeDto>.Failure(new Error("PackagingType.DuplicateCode", $"Packaging type with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        var category = Enum.Parse<PackagingCategory>(data.Category);
        var entity = new PackagingType(data.Code, data.Name, category);
        entity.SetTenantId(request.TenantId);

        entity.SetDescription(data.Description);
        entity.SetDimensions(data.Length, data.Width, data.Height);
        entity.SetWeightInfo(data.EmptyWeight, data.MaxWeightCapacity);
        entity.SetCapacity(data.DefaultQuantity, data.MaxQuantity);
        entity.SetStackingInfo(data.IsStackable, data.StackableCount);
        entity.SetPalletInfo(data.UnitsPerPallet, data.UnitsPerPalletLayer);
        entity.SetMaterialInfo(data.MaterialType, data.IsRecyclable);
        entity.SetReturnableInfo(data.IsReturnable, data.DepositAmount);

        if (!string.IsNullOrEmpty(data.BarcodePrefix) || !string.IsNullOrEmpty(data.DefaultBarcodeType))
        {
            BarcodeType? barcodeType = null;
            if (!string.IsNullOrEmpty(data.DefaultBarcodeType))
                barcodeType = Enum.Parse<BarcodeType>(data.DefaultBarcodeType);
            entity.SetBarcodeInfo(data.BarcodePrefix, barcodeType);
        }

        await _unitOfWork.PackagingTypes.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PackagingTypeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            Category = entity.Category.ToString(),
            IsActive = entity.IsActive,
            Length = entity.Length,
            Width = entity.Width,
            Height = entity.Height,
            Volume = entity.Volume,
            EmptyWeight = entity.EmptyWeight,
            MaxWeightCapacity = entity.MaxWeightCapacity,
            DefaultQuantity = entity.DefaultQuantity,
            MaxQuantity = entity.MaxQuantity,
            IsStackable = entity.IsStackable,
            StackableCount = entity.StackableCount,
            UnitsPerPallet = entity.UnitsPerPallet,
            UnitsPerPalletLayer = entity.UnitsPerPalletLayer,
            BarcodePrefix = entity.BarcodePrefix,
            DefaultBarcodeType = entity.DefaultBarcodeType?.ToString(),
            MaterialType = entity.MaterialType,
            IsRecyclable = entity.IsRecyclable,
            IsReturnable = entity.IsReturnable,
            DepositAmount = entity.DepositAmount,
            CreatedAt = entity.CreatedDate
        };

        return Result<PackagingTypeDto>.Success(dto);
    }
}
