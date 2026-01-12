using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.BillOfMaterials.Commands;

public record CreateBillOfMaterialCommand(CreateBillOfMaterialRequest Request) : IRequest<BillOfMaterialDto>;

public class CreateBillOfMaterialCommandValidator : AbstractValidator<CreateBillOfMaterialCommand>
{
    public CreateBillOfMaterialCommandValidator()
    {
        RuleFor(x => x.Request.Code)
            .NotEmpty().WithMessage("Ürün reçetesi kodu zorunludur.")
            .MinimumLength(2).WithMessage("Ürün reçetesi kodu en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Ürün reçetesi kodu en fazla 50 karakter olabilir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Ürün reçetesi adı zorunludur.")
            .MinimumLength(2).WithMessage("Ürün reçetesi adı en az 2 karakter olmalıdır.")
            .MaximumLength(200).WithMessage("Ürün reçetesi adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Request.ProductId)
            .GreaterThan(0).WithMessage("Ürün ID geçerli olmalıdır.");

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

        RuleForEach(x => x.Request.Lines).SetValidator(new CreateBomLineRequestValidator());
    }
}

public class CreateBomLineRequestValidator : AbstractValidator<CreateBomLineRequest>
{
    public CreateBomLineRequestValidator()
    {
        RuleFor(x => x.ComponentProductId)
            .GreaterThan(0).WithMessage("Bileşen ürün ID geçerli olmalıdır.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Birim zorunludur.")
            .MaximumLength(20).WithMessage("Birim en fazla 20 karakter olabilir.");

        RuleFor(x => x.Sequence)
            .GreaterThanOrEqualTo(0).WithMessage("Sıra numarası negatif olamaz.");

        RuleFor(x => x.ScrapRate)
            .InclusiveBetween(0, 100).WithMessage("Fire oranı 0-100 arasında olmalıdır.");
    }
}

public class CreateBillOfMaterialCommandHandler : IRequestHandler<CreateBillOfMaterialCommand, BillOfMaterialDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateBillOfMaterialCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BillOfMaterialDto> Handle(CreateBillOfMaterialCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        // Check if code already exists
        if (await _unitOfWork.BillOfMaterials.ExistsAsync(tenantId, request.Code, cancellationToken))
            throw new InvalidOperationException($"'{request.Code}' kodlu ürün reçetesi zaten mevcut.");

        var bomType = Enum.Parse<BomType>(request.Type, true);
        var bom = new BillOfMaterial(request.Code, request.Name, request.ProductId, bomType, request.BaseUnit);

        // Set production info
        bom.SetProductionInfo(request.BaseQuantity, request.BaseUnit, request.StandardYield, request.ScrapRate);

        // Set effective dates
        if (request.EffectiveStartDate.HasValue || request.EffectiveEndDate.HasValue)
        {
            bom.SetEffectiveDates(request.EffectiveStartDate, request.EffectiveEndDate);
        }

        // Set default routing
        if (request.DefaultRoutingId.HasValue)
        {
            bom.SetDefaultRouting(request.DefaultRoutingId.Value);
        }

        // Add lines
        if (request.Lines != null)
        {
            foreach (var lineRequest in request.Lines)
            {
                var line = bom.AddLine(lineRequest.ComponentProductId, lineRequest.Quantity, lineRequest.Unit, lineRequest.Sequence);

                var lineType = Enum.Parse<BomLineType>(lineRequest.Type, true);
                line.SetType(lineType);
                line.SetScrapRate(lineRequest.ScrapRate);

                if (lineRequest.IsPhantom)
                    line.MarkAsPhantom();

                if (lineRequest.OperationSequence.HasValue)
                    line.SetOperationSequence(lineRequest.OperationSequence.Value);

                var consumptionMethod = Enum.Parse<ConsumptionMethod>(lineRequest.ConsumptionMethod, true);
                var consumptionTiming = Enum.Parse<ConsumptionTiming>(lineRequest.ConsumptionTiming, true);
                line.SetConsumption(consumptionMethod, consumptionTiming);

                if (!string.IsNullOrEmpty(lineRequest.Notes))
                    line.SetNotes(lineRequest.Notes);
            }
        }

        // Add co-products
        if (request.CoProducts != null)
        {
            foreach (var coProductRequest in request.CoProducts)
            {
                var coProduct = bom.AddCoProduct(
                    coProductRequest.ProductId,
                    coProductRequest.Quantity,
                    coProductRequest.Unit,
                    coProductRequest.CostAllocationPercent);

                var coProductType = Enum.Parse<CoProductType>(coProductRequest.Type, true);
                coProduct.SetType(coProductType);
                coProduct.SetYield(coProductRequest.YieldPercent);

                var allocationMethod = Enum.Parse<CostAllocationMethod>(coProductRequest.CostAllocationMethod, true);
                coProduct.SetCostAllocation(coProductRequest.CostAllocationPercent, allocationMethod);
            }
        }

        await _unitOfWork.BillOfMaterials.AddAsync(bom, cancellationToken);
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
