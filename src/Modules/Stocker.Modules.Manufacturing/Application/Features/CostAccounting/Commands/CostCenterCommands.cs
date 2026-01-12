using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Commands;

public record CreateCostCenterCommand(CreateCostCenterRequest Request) : IRequest<CostCenterDto>;

public class CreateCostCenterCommandHandler : IRequestHandler<CreateCostCenterCommand, CostCenterDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CreateCostCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CostCenterDto> Handle(CreateCostCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var existingCode = await _unitOfWork.CostCenters.GetByCodeAsync(request.Code, cancellationToken);
        if (existingCode != null && existingCode.TenantId == tenantId)
            throw new InvalidOperationException($"'{request.Code}' kodlu maliyet merkezi zaten mevcut.");

        var type = Enum.Parse<CostCenterType>(request.Type);
        var costCenter = new CostCenter(request.Code, request.Name, type);

        if (!string.IsNullOrEmpty(request.Description))
            costCenter.SetDescription(request.Description);

        if (request.ParentCostCenterId.HasValue)
            costCenter.SetParent(request.ParentCostCenterId.Value);

        if (!string.IsNullOrEmpty(request.ResponsiblePerson))
            costCenter.SetResponsiblePerson(request.ResponsiblePerson);

        if (request.WorkCenterId.HasValue)
            costCenter.LinkToWorkCenter(request.WorkCenterId.Value);

        if (request.BudgetAmount > 0)
            costCenter.SetBudget(request.BudgetAmount);

        _unitOfWork.CostCenters.Add(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CostCenterDto(
            costCenter.Id,
            costCenter.Code,
            costCenter.Name,
            costCenter.Description,
            costCenter.Type.ToString(),
            costCenter.ParentCostCenterId,
            null,
            costCenter.ResponsiblePerson,
            costCenter.WorkCenterId,
            null,
            costCenter.BudgetAmount,
            costCenter.ActualAmount,
            costCenter.VarianceAmount,
            costCenter.IsActive,
            costCenter.CreatedDate,
            null);
    }
}

public record UpdateCostCenterCommand(int Id, UpdateCostCenterRequest Request) : IRequest;

public class UpdateCostCenterCommandHandler : IRequestHandler<UpdateCostCenterCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateCostCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateCostCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet merkezi bulunamadı.");

        if (costCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu maliyet merkezine erişim yetkiniz yok.");

        if (!string.IsNullOrEmpty(command.Request.Description))
            costCenter.SetDescription(command.Request.Description);

        if (!string.IsNullOrEmpty(command.Request.ResponsiblePerson))
            costCenter.SetResponsiblePerson(command.Request.ResponsiblePerson);

        if (command.Request.WorkCenterId.HasValue)
            costCenter.LinkToWorkCenter(command.Request.WorkCenterId.Value);

        if (command.Request.BudgetAmount.HasValue)
            costCenter.SetBudget(command.Request.BudgetAmount.Value);

        _unitOfWork.CostCenters.Update(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record UpdateCostCenterActualCommand(int Id, decimal Amount) : IRequest;

public class UpdateCostCenterActualCommandHandler : IRequestHandler<UpdateCostCenterActualCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateCostCenterActualCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateCostCenterActualCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet merkezi bulunamadı.");

        if (costCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu maliyet merkezine erişim yetkiniz yok.");

        costCenter.UpdateActual(command.Amount);

        _unitOfWork.CostCenters.Update(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ActivateCostCenterCommand(int Id) : IRequest;

public class ActivateCostCenterCommandHandler : IRequestHandler<ActivateCostCenterCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateCostCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateCostCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet merkezi bulunamadı.");

        if (costCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu maliyet merkezine erişim yetkiniz yok.");

        costCenter.Activate();

        _unitOfWork.CostCenters.Update(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeactivateCostCenterCommand(int Id) : IRequest;

public class DeactivateCostCenterCommandHandler : IRequestHandler<DeactivateCostCenterCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeactivateCostCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeactivateCostCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet merkezi bulunamadı.");

        if (costCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu maliyet merkezine erişim yetkiniz yok.");

        costCenter.Deactivate();

        _unitOfWork.CostCenters.Update(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteCostCenterCommand(int Id) : IRequest;

public class DeleteCostCenterCommandHandler : IRequestHandler<DeleteCostCenterCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteCostCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteCostCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetWithChildrenAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet merkezi bulunamadı.");

        if (costCenter.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu maliyet merkezini silme yetkiniz yok.");

        if (costCenter.ChildCostCenters.Any())
            throw new InvalidOperationException("Alt maliyet merkezleri olan maliyet merkezi silinemez.");

        _unitOfWork.CostCenters.Delete(costCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
