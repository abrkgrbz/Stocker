using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Commands;

public record UpdateBillOfMaterialCommand(int Id, UpdateBillOfMaterialRequest Request) : IRequest<BillOfMaterialDto>;

public class UpdateBillOfMaterialCommandValidator : AbstractValidator<UpdateBillOfMaterialCommand>
{
    public UpdateBillOfMaterialCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir ID gereklidir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Ürün reçetesi adı zorunludur.")
            .MinimumLength(2).WithMessage("Ürün reçetesi adı en az 2 karakter olmalıdır.")
            .MaximumLength(200).WithMessage("Ürün reçetesi adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Request.Type)
            .NotEmpty().WithMessage("Ürün reçetesi tipi zorunludur.");

        RuleFor(x => x.Request.BaseUnit)
            .NotEmpty().WithMessage("Temel birim zorunludur.")
            .MaximumLength(20).WithMessage("Temel birim en fazla 20 karakter olabilir.");

        RuleFor(x => x.Request.BaseQuantity)
            .GreaterThan(0).WithMessage("Temel miktar sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.StandardYield)
            .InclusiveBetween(0, 100).WithMessage("Standart verim 0-100 arasında olmalıdır.");

        RuleFor(x => x.Request.ScrapRate)
            .InclusiveBetween(0, 100).WithMessage("Fire oranı 0-100 arasında olmalıdır.");
    }
}

public class UpdateBillOfMaterialCommandHandler : IRequestHandler<UpdateBillOfMaterialCommand, BillOfMaterialDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateBillOfMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BillOfMaterialDto> Handle(UpdateBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var bom = await _unitOfWork.BillOfMaterials.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan ürün reçetesi bulunamadı.");

        // Verify tenant access
        if (bom.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        // Check if status allows update
        if (bom.Status == BomStatus.Aktif)
            throw new InvalidOperationException("Aktif durumdaki ürün reçetesi güncellenemez. Önce pasif duruma getiriniz.");

        var bomType = Enum.Parse<BomType>(request.Type, true);
        bom.Update(request.Name, request.Description, bomType);
        bom.SetProductionInfo(request.BaseQuantity, request.BaseUnit, request.StandardYield, request.ScrapRate);
        bom.SetEffectiveDates(request.EffectiveStartDate, request.EffectiveEndDate);
        bom.SetDefaultRouting(request.DefaultRoutingId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(bom);
    }

    private static BillOfMaterialDto MapToDto(BillOfMaterial entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.ProductId,
        null,
        null,
        entity.Version,
        entity.RevisionNumber,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.BaseQuantity,
        entity.BaseUnit,
        entity.StandardYield,
        entity.ScrapRate,
        entity.EffectiveStartDate,
        entity.EffectiveEndDate,
        entity.EstimatedMaterialCost,
        entity.EstimatedLaborCost,
        entity.EstimatedOverheadCost,
        entity.TotalEstimatedCost,
        entity.DefaultRoutingId,
        null,
        entity.IsDefault,
        entity.IsActive,
        entity.CreatedDate,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Lines.Select(l => new BomLineDto(
            l.Id, l.Sequence, l.ComponentProductId, null, null,
            l.Type.ToString(), l.Quantity, l.Unit, l.ScrapRate,
            l.UnitCost, l.TotalCost, l.IsPhantom, l.OperationSequence,
            l.ConsumptionMethod.ToString(), l.ConsumptionTiming.ToString(), l.IsActive)).ToList(),
        entity.CoProducts.Select(c => new BomCoProductDto(
            c.Id, c.ProductId, null, null, c.Type.ToString(),
            c.Quantity, c.Unit, c.YieldPercent, c.CostAllocationPercent,
            c.CostAllocationMethod.ToString(), c.UnitValue, c.TotalValue, c.IsActive)).ToList());
}
