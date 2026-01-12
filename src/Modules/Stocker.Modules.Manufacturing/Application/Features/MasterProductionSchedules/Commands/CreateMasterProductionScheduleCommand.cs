using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MasterProductionSchedules.Commands;

public record CreateMasterProductionScheduleCommand(CreateMasterProductionScheduleRequest Request) : IRequest<MasterProductionScheduleDto>;

public class CreateMasterProductionScheduleCommandHandler : IRequestHandler<CreateMasterProductionScheduleCommand, MasterProductionScheduleDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateMasterProductionScheduleCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<MasterProductionScheduleDto> Handle(CreateMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var scheduleNumber = $"MPS-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        if (!Enum.TryParse<MpsPeriodType>(request.PeriodType, out var periodType))
            throw new ArgumentException($"Geçersiz dönem tipi: {request.PeriodType}");

        var schedule = new MasterProductionSchedule(
            scheduleNumber,
            request.Name,
            request.PeriodStart,
            request.PeriodEnd,
            periodType);

        schedule.SetPlanningFences(
            request.FrozenPeriodDays,
            request.SlushyPeriodDays,
            request.FreePeriodDays);

        if (!string.IsNullOrEmpty(userName))
            schedule.SetCreatedBy(userName);

        if (!string.IsNullOrEmpty(request.Notes))
            schedule.SetNotes(request.Notes);

        _unitOfWork.MasterProductionSchedules.Add(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(schedule);
    }

    private static MasterProductionScheduleDto MapToDto(MasterProductionSchedule entity) => new(
        entity.Id,
        entity.ScheduleNumber,
        entity.Name,
        entity.Status.ToString(),
        entity.PeriodStart,
        entity.PeriodEnd,
        entity.PeriodType.ToString(),
        entity.FrozenPeriodDays,
        entity.SlushyPeriodDays,
        entity.FreePeriodDays,
        entity.CreatedBy,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Notes,
        entity.IsActive,
        entity.CreatedDate,
        null);
}

public record UpdateMasterProductionScheduleCommand(int Id, UpdateMasterProductionScheduleRequest Request) : IRequest<MasterProductionScheduleDto>;

public class UpdateMasterProductionScheduleCommandHandler : IRequestHandler<UpdateMasterProductionScheduleCommand, MasterProductionScheduleDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateMasterProductionScheduleCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MasterProductionScheduleDto> Handle(UpdateMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        if (schedule.Status != MpsStatus.Taslak)
            throw new InvalidOperationException("Sadece taslak durumdaki MPS güncellenebilir.");

        schedule.SetPlanningFences(
            request.FrozenPeriodDays,
            request.SlushyPeriodDays,
            request.FreePeriodDays);

        if (!string.IsNullOrEmpty(request.Notes))
            schedule.SetNotes(request.Notes);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(schedule);
    }

    private static MasterProductionScheduleDto MapToDto(MasterProductionSchedule entity) => new(
        entity.Id,
        entity.ScheduleNumber,
        entity.Name,
        entity.Status.ToString(),
        entity.PeriodStart,
        entity.PeriodEnd,
        entity.PeriodType.ToString(),
        entity.FrozenPeriodDays,
        entity.SlushyPeriodDays,
        entity.FreePeriodDays,
        entity.CreatedBy,
        entity.ApprovedBy,
        entity.ApprovalDate,
        entity.Notes,
        entity.IsActive,
        entity.CreatedDate,
        null);
}

public record SubmitMasterProductionScheduleCommand(int Id) : IRequest;

public class SubmitMasterProductionScheduleCommandHandler : IRequestHandler<SubmitMasterProductionScheduleCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SubmitMasterProductionScheduleCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmitMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        schedule.Submit();

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ApproveMasterProductionScheduleCommand(int Id) : IRequest;

public class ApproveMasterProductionScheduleCommandHandler : IRequestHandler<ApproveMasterProductionScheduleCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApproveMasterProductionScheduleCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        schedule.Approve(userName);

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record ActivateMasterProductionScheduleCommand(int Id) : IRequest;

public class ActivateMasterProductionScheduleCommandHandler : IRequestHandler<ActivateMasterProductionScheduleCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateMasterProductionScheduleCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ActivateMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'e erişim yetkiniz yok.");

        schedule.Activate();

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CancelMasterProductionScheduleCommand(int Id) : IRequest;

public class CancelMasterProductionScheduleCommandHandler : IRequestHandler<CancelMasterProductionScheduleCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelMasterProductionScheduleCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'i iptal etme yetkiniz yok.");

        schedule.Cancel();

        _unitOfWork.MasterProductionSchedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteMasterProductionScheduleCommand(int Id) : IRequest;

public class DeleteMasterProductionScheduleCommandHandler : IRequestHandler<DeleteMasterProductionScheduleCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteMasterProductionScheduleCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteMasterProductionScheduleCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var schedule = await _unitOfWork.MasterProductionSchedules.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan MPS bulunamadı.");

        if (schedule.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu MPS'i silme yetkiniz yok.");

        if (schedule.Status == MpsStatus.Aktif)
            throw new InvalidOperationException("Aktif MPS silinemez.");

        _unitOfWork.MasterProductionSchedules.Delete(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
