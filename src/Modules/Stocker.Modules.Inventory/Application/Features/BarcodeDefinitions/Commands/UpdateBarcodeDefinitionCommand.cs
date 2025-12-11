using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Commands;

/// <summary>
/// Command to update an existing barcode definition
/// </summary>
public class UpdateBarcodeDefinitionCommand : IRequest<Result<BarcodeDefinitionDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateBarcodeDefinitionDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateBarcodeDefinitionCommand
/// </summary>
public class UpdateBarcodeDefinitionCommandValidator : AbstractValidator<UpdateBarcodeDefinitionCommand>
{
    public UpdateBarcodeDefinitionCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Description).MaximumLength(500);
        RuleFor(x => x.Data.ManufacturerCode).MaximumLength(50);
        RuleFor(x => x.Data.Gtin).MaximumLength(50);
    }
}

/// <summary>
/// Handler for UpdateBarcodeDefinitionCommand
/// </summary>
public class UpdateBarcodeDefinitionCommandHandler : IRequestHandler<UpdateBarcodeDefinitionCommand, Result<BarcodeDefinitionDto>>
{
    private readonly IBarcodeDefinitionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBarcodeDefinitionCommandHandler(IBarcodeDefinitionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BarcodeDefinitionDto>> Handle(UpdateBarcodeDefinitionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<BarcodeDefinitionDto>.Failure(new Error("BarcodeDefinition.NotFound", $"Barcode definition with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        if (data.IsPrimary)
            entity.SetAsPrimary();
        else
            entity.RemovePrimary();

        if (data.IsActive)
            entity.Activate();
        else
            entity.Deactivate();

        entity.SetVariant(data.ProductVariantId);
        entity.SetUnit(data.UnitId, data.QuantityPerUnit);
        entity.SetPackagingType(data.PackagingTypeId);
        entity.SetManufacturerInfo(data.IsManufacturerBarcode, data.ManufacturerCode, data.Gtin);
        entity.SetDescription(data.Description);
        entity.SetValidityPeriod(data.ValidFrom, data.ValidUntil);

        await _repository.UpdateAsync(entity, cancellationToken);
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
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<BarcodeDefinitionDto>.Success(dto);
    }
}
