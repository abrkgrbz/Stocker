using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Commands;

/// <summary>
/// Command to create a new barcode definition
/// </summary>
public class CreateBarcodeDefinitionCommand : IRequest<Result<BarcodeDefinitionDto>>
{
    public Guid TenantId { get; set; }
    public CreateBarcodeDefinitionDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateBarcodeDefinitionCommand
/// </summary>
public class CreateBarcodeDefinitionCommandValidator : AbstractValidator<CreateBarcodeDefinitionCommand>
{
    public CreateBarcodeDefinitionCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.Barcode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.BarcodeType).NotEmpty();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.ManufacturerCode).MaximumLength(50);
        RuleFor(x => x.Data.Gtin).MaximumLength(50);
    }
}

/// <summary>
/// Handler for CreateBarcodeDefinitionCommand
/// </summary>
public class CreateBarcodeDefinitionCommandHandler : IRequestHandler<CreateBarcodeDefinitionCommand, Result<BarcodeDefinitionDto>>
{
    private readonly IBarcodeDefinitionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBarcodeDefinitionCommandHandler(IBarcodeDefinitionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BarcodeDefinitionDto>> Handle(CreateBarcodeDefinitionCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check if barcode already exists
        var existingBarcode = await _repository.GetByBarcodeValueAsync(data.Barcode, cancellationToken);
        if (existingBarcode != null)
        {
            return Result<BarcodeDefinitionDto>.Failure(new Error("BarcodeDefinition.DuplicateBarcode", $"Barcode '{data.Barcode}' already exists", ErrorType.Conflict));
        }

        var barcodeType = Enum.Parse<BarcodeType>(data.BarcodeType);
        var entity = new BarcodeDefinition(data.ProductId, data.Barcode, barcodeType, data.IsPrimary);

        if (data.ProductVariantId.HasValue)
            entity.SetVariant(data.ProductVariantId);

        if (data.UnitId.HasValue)
            entity.SetUnit(data.UnitId, data.QuantityPerUnit);

        if (data.PackagingTypeId.HasValue)
            entity.SetPackagingType(data.PackagingTypeId);

        entity.SetManufacturerInfo(data.IsManufacturerBarcode, data.ManufacturerCode, data.Gtin);
        entity.SetDescription(data.Description);
        entity.SetValidityPeriod(data.ValidFrom, data.ValidUntil);

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new BarcodeDefinitionDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ProductVariantId = entity.ProductVariantId,
            Barcode = entity.Barcode,
            BarcodeType = entity.BarcodeType.ToString(),
            IsPrimary = entity.IsPrimary,
            IsActive = entity.IsActive,
            UnitId = entity.UnitId,
            QuantityPerUnit = entity.QuantityPerUnit,
            PackagingTypeId = entity.PackagingTypeId,
            IsManufacturerBarcode = entity.IsManufacturerBarcode,
            ManufacturerCode = entity.ManufacturerCode,
            Gtin = entity.Gtin,
            Description = entity.Description,
            ValidFrom = entity.ValidFrom,
            ValidUntil = entity.ValidUntil,
            CreatedAt = entity.CreatedDate
        };

        return Result<BarcodeDefinitionDto>.Success(dto);
    }
}
