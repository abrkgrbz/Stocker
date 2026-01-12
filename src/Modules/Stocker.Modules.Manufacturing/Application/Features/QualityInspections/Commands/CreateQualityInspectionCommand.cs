using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Commands;

public record CreateQualityInspectionCommand(CreateQualityInspectionRequest Request) : IRequest<QualityInspectionListDto>;

public class CreateQualityInspectionCommandValidator : AbstractValidator<CreateQualityInspectionCommand>
{
    public CreateQualityInspectionCommandValidator()
    {
        RuleFor(x => x.Request.InspectionType)
            .NotEmpty().WithMessage("Denetim türü zorunludur.")
            .Must(BeValidInspectionType).WithMessage("Geçerli bir denetim türü seçiniz (Girdi, Proses, Final, Rutin).");

        RuleFor(x => x.Request.ProductId)
            .NotEmpty().WithMessage("Ürün seçimi zorunludur.");

        RuleFor(x => x.Request.SampleSize)
            .GreaterThan(0).WithMessage("Numune büyüklüğü sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.SamplingMethod)
            .NotEmpty().WithMessage("Örnekleme yöntemi zorunludur.");
    }

    private static bool BeValidInspectionType(string type)
        => new[] { "Girdi", "Proses", "Final", "Rutin" }.Contains(type);
}

public class CreateQualityInspectionCommandHandler : IRequestHandler<CreateQualityInspectionCommand, QualityInspectionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateQualityInspectionCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<QualityInspectionListDto> Handle(CreateQualityInspectionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");
        var request = command.Request;

        var inspectionNumber = await _unitOfWork.QualityInspections.GenerateInspectionNumberAsync(tenantId, cancellationToken);

        var inspection = new QualityInspection(
            Guid.NewGuid(),
            tenantId,
            inspectionNumber,
            request.InspectionType,
            request.ProductId,
            userId,
            userId);

        if (request.ProductionOrderId.HasValue)
        {
            inspection.SetProductionReference(
                request.ProductionOrderId,
                request.ProductionOperationId,
                request.ProductionReceiptId);
        }

        inspection.SetSampleInfo(
            request.SampleSize,
            0, // InspectedQuantity will be set during inspection
            request.SamplingMethod,
            request.AcceptanceCriteria);

        await _unitOfWork.QualityInspections.AddAsync(inspection, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToListDto(inspection);
    }

    private static QualityInspectionListDto MapToListDto(QualityInspection entity) => new(
        entity.Id,
        entity.InspectionNumber,
        entity.InspectionType,
        entity.ProductionOrderId,
        null,
        entity.ProductId,
        null,
        null,
        entity.Result,
        entity.TotalDefects,
        entity.InspectorName,
        entity.InspectionDate,
        entity.Status);
}
