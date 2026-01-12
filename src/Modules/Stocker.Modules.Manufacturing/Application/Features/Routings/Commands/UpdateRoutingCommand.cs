using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;

public record UpdateRoutingCommand(int Id, UpdateRoutingRequest Request) : IRequest<RoutingDto>;

public class UpdateRoutingCommandValidator : AbstractValidator<UpdateRoutingCommand>
{
    public UpdateRoutingCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir ID gereklidir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Rota adı zorunludur.")
            .MinimumLength(2).WithMessage("Rota adı en az 2 karakter olmalıdır.")
            .MaximumLength(200).WithMessage("Rota adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Request.Type)
            .NotEmpty().WithMessage("Rota tipi zorunludur.");

        RuleFor(x => x.Request.BaseUnit)
            .NotEmpty().WithMessage("Temel birim zorunludur.");

        RuleFor(x => x.Request.BaseQuantity)
            .GreaterThan(0).WithMessage("Temel miktar sıfırdan büyük olmalıdır.");
    }
}

public class UpdateRoutingCommandHandler : IRequestHandler<UpdateRoutingCommand, RoutingDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateRoutingCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RoutingDto> Handle(UpdateRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var routing = await _unitOfWork.Routings.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan rota bulunamadı.");
        
        // Verify tenant access
        if (routing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaynağa erişim yetkiniz bulunmamaktadır.");

        if (routing.Status == RoutingStatus.Aktif)
            throw new InvalidOperationException("Aktif durumdaki rota güncellenemez. Önce pasif duruma getiriniz.");

        var routingType = Enum.Parse<RoutingType>(request.Type, true);
        routing.Update(request.Name, request.Description, routingType);
        routing.SetBaseQuantity(request.BaseQuantity, request.BaseUnit);
        routing.SetEffectiveDates(request.EffectiveStartDate, request.EffectiveEndDate);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(routing);
    }

    private static RoutingDto MapToDto(Routing entity) => new(
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
        entity.EffectiveStartDate,
        entity.EffectiveEndDate,
        entity.TotalSetupTime,
        entity.TotalRunTime,
        entity.TotalQueueTime,
        entity.TotalMoveTime,
        entity.TotalLeadTime,
        entity.EstimatedLaborCost,
        entity.EstimatedMachineCost,
        entity.EstimatedOverheadCost,
        entity.TotalEstimatedCost,
        entity.IsDefault,
        entity.IsActive,
        entity.CreatedDate,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Operations.Select(op => new OperationDto(
            op.Id, op.Sequence, op.Code, op.Name, op.Type.ToString(),
            op.WorkCenterId, null, null, op.MachineId, null,
            op.SetupTime, op.RunTime, op.QueueTime, op.MoveTime,
            op.SetupTime + op.RunTime + op.QueueTime + op.MoveTime,
            op.SetupCost, op.RunCost, op.MachineCost, op.OverheadCost, op.TotalCost,
            op.MinimumWorkers, op.MaximumWorkers, op.IsSubcontracted, op.SubcontractorId,
            op.IsMilestone, op.RequiresQualityCheck, op.IsActive)).ToList());
}
