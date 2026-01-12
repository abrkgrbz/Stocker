using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.Routings.Commands;

public record CreateRoutingCommand(CreateRoutingRequest Request) : IRequest<RoutingDto>;

public class CreateRoutingCommandValidator : AbstractValidator<CreateRoutingCommand>
{
    public CreateRoutingCommandValidator()
    {
        RuleFor(x => x.Request.Code)
            .NotEmpty().WithMessage("Rota kodu zorunludur.")
            .MinimumLength(2).WithMessage("Rota kodu en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Rota kodu en fazla 50 karakter olabilir.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("Rota adı zorunludur.")
            .MinimumLength(2).WithMessage("Rota adı en az 2 karakter olmalıdır.")
            .MaximumLength(200).WithMessage("Rota adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Request.ProductId)
            .GreaterThan(0).WithMessage("Ürün ID geçerli olmalıdır.");

        RuleFor(x => x.Request.Type)
            .NotEmpty().WithMessage("Rota tipi zorunludur.");

        RuleFor(x => x.Request.BaseUnit)
            .NotEmpty().WithMessage("Temel birim zorunludur.")
            .MaximumLength(20).WithMessage("Temel birim en fazla 20 karakter olabilir.");

        RuleFor(x => x.Request.BaseQuantity)
            .GreaterThan(0).WithMessage("Temel miktar sıfırdan büyük olmalıdır.");

        RuleForEach(x => x.Request.Operations).SetValidator(new CreateOperationRequestValidator());
    }
}

public class CreateOperationRequestValidator : AbstractValidator<CreateOperationRequest>
{
    public CreateOperationRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Operasyon kodu zorunludur.")
            .MaximumLength(20).WithMessage("Operasyon kodu en fazla 20 karakter olabilir.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Operasyon adı zorunludur.")
            .MaximumLength(100).WithMessage("Operasyon adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.WorkCenterId)
            .GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");

        RuleFor(x => x.Sequence)
            .GreaterThanOrEqualTo(0).WithMessage("Sıra numarası negatif olamaz.");

        RuleFor(x => x.SetupTime)
            .GreaterThanOrEqualTo(0).WithMessage("Setup süresi negatif olamaz.");

        RuleFor(x => x.RunTime)
            .GreaterThanOrEqualTo(0).WithMessage("Çalışma süresi negatif olamaz.");
    }
}

public class CreateRoutingCommandHandler : IRequestHandler<CreateRoutingCommand, RoutingDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateRoutingCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RoutingDto> Handle(CreateRoutingCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        // Check if code already exists
        if (await _unitOfWork.Routings.ExistsAsync(tenantId, request.Code, cancellationToken))
            throw new InvalidOperationException($"'{request.Code}' kodlu rota zaten mevcut.");

        var routingType = Enum.Parse<RoutingType>(request.Type, true);
        var routing = new Routing(request.Code, request.Name, request.ProductId, routingType, request.BaseUnit);

        // Set base quantity
        routing.SetBaseQuantity(request.BaseQuantity, request.BaseUnit);

        // Set effective dates
        if (request.EffectiveStartDate.HasValue || request.EffectiveEndDate.HasValue)
        {
            routing.SetEffectiveDates(request.EffectiveStartDate, request.EffectiveEndDate);
        }

        // Add operations
        if (request.Operations != null)
        {
            foreach (var opRequest in request.Operations)
            {
                var operation = routing.AddOperation(opRequest.Code, opRequest.Name, opRequest.WorkCenterId, opRequest.Sequence);

                var opType = Enum.Parse<OperationType>(opRequest.Type, true);
                operation.SetType(opType);
                operation.SetMachine(opRequest.MachineId);
                operation.SetTimes(opRequest.SetupTime, opRequest.RunTime, 0, opRequest.QueueTime, opRequest.MoveTime, 0);
                operation.SetCapacity(1, 1, opRequest.MinimumWorkers, opRequest.MaximumWorkers, 1);
                operation.SetSubcontracting(opRequest.IsSubcontracted, opRequest.SubcontractorId, null, 0);
                operation.SetQualityRequirements(opRequest.RequiresQualityCheck, opRequest.IsMilestone, null, 0, 0);

                if (!string.IsNullOrEmpty(opRequest.Notes))
                    operation.SetNotes(opRequest.Notes);
            }
        }

        await _unitOfWork.Routings.AddAsync(routing, cancellationToken);
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
