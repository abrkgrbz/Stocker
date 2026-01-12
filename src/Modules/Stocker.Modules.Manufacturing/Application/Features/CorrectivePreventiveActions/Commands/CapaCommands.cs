using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CorrectivePreventiveActions.Commands;

#region Create CAPA

public record CreateCapaCommand(CreateCapaRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class CreateCapaCommandValidator : AbstractValidator<CreateCapaCommand>
{
    public CreateCapaCommandValidator()
    {
        RuleFor(x => x.Request.Type)
            .IsInEnum().WithMessage("Geçerli bir CAPA tipi seçiniz.");

        RuleFor(x => x.Request.Description)
            .NotEmpty().WithMessage("Açıklama zorunludur.")
            .MaximumLength(2000).WithMessage("Açıklama en fazla 2000 karakter olabilir.");

        RuleFor(x => x.Request.ResponsiblePerson)
            .NotEmpty().WithMessage("Sorumlu kişi zorunludur.")
            .MaximumLength(100).WithMessage("Sorumlu kişi en fazla 100 karakter olabilir.");

        RuleFor(x => x.Request.DueDate)
            .GreaterThan(DateTime.UtcNow.Date).WithMessage("Hedef tarih bugünden sonra olmalıdır.");
    }
}

public class CreateCapaCommandHandler : IRequestHandler<CreateCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateCapaCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(CreateCapaCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var capa = new CorrectivePreventiveAction(
            request.NonConformanceReportId,
            request.Type,
            request.Description,
            request.ResponsiblePerson,
            request.DueDate);

        capa.SetTenantId(tenantId);
        capa.SetPriority(request.Priority);

        if (!string.IsNullOrEmpty(request.ObjectiveStatement))
            capa.SetObjective(request.ObjectiveStatement, request.ScopeDefinition ?? string.Empty);

        capa.SetResponsibility(request.ResponsibleUserId, request.ResponsibleDepartment);

        if (request.PlannedStartDate.HasValue && request.PlannedEndDate.HasValue)
            capa.SetPlannedDates(request.PlannedStartDate.Value, request.PlannedEndDate.Value);

        if (request.RootCauseCategory.HasValue)
            capa.SetRootCause(request.RootCauseCategory.Value, request.RootCauseDescription ?? string.Empty);

        if (!string.IsNullOrEmpty(request.ActionPlan))
            capa.SetActionPlan(request.ActionPlan, request.ResourcesRequired, request.EstimatedCost);

        if (!string.IsNullOrEmpty(request.VerificationMethod))
            capa.SetVerificationMethod(request.VerificationMethod);

        capa.SetCreatedBy(_currentUser.UserName ?? "Sistem");
        capa.SetNotes(request.Notes);

        await _unitOfWork.CorrectivePreventiveActions.AddAsync(capa, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Update CAPA

public record UpdateCapaCommand(int Id, UpdateCapaRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class UpdateCapaCommandHandler : IRequestHandler<UpdateCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateCapaCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(UpdateCapaCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        if (capa.Status == CapaStatus.Kapatıldı || capa.Status == CapaStatus.İptal)
            throw new InvalidOperationException("Kapatılmış veya iptal edilmiş CAPA güncellenemez.");

        capa.SetPriority(command.Request.Priority);

        if (!string.IsNullOrEmpty(command.Request.ObjectiveStatement))
            capa.SetObjective(command.Request.ObjectiveStatement, command.Request.ScopeDefinition ?? string.Empty);

        if (command.Request.PlannedStartDate.HasValue && command.Request.PlannedEndDate.HasValue)
            capa.SetPlannedDates(command.Request.PlannedStartDate.Value, command.Request.PlannedEndDate.Value);

        if (!string.IsNullOrEmpty(command.Request.ActionPlan))
            capa.SetActionPlan(command.Request.ActionPlan, command.Request.ResourcesRequired, command.Request.EstimatedCost);

        if (!string.IsNullOrEmpty(command.Request.VerificationMethod))
            capa.SetVerificationMethod(command.Request.VerificationMethod);

        capa.SetNotes(command.Request.Notes);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Open CAPA

public record OpenCapaCommand(int Id) : IRequest<CorrectivePreventiveActionListDto>;

public class OpenCapaCommandHandler : IRequestHandler<OpenCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public OpenCapaCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(OpenCapaCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.Open();

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Start Planning

public record StartCapaPlanningCommand(int Id) : IRequest<CorrectivePreventiveActionListDto>;

public class StartCapaPlanningCommandHandler : IRequestHandler<StartCapaPlanningCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartCapaPlanningCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(StartCapaPlanningCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.StartPlanning();

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Start Implementation

public record StartCapaImplementationCommand(int Id) : IRequest<CorrectivePreventiveActionListDto>;

public class StartCapaImplementationCommandHandler : IRequestHandler<StartCapaImplementationCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartCapaImplementationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(StartCapaImplementationCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.StartImplementation();

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Update Progress

public record UpdateCapaProgressCommand(int Id, UpdateCapaProgressRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class UpdateCapaProgressCommandHandler : IRequestHandler<UpdateCapaProgressCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateCapaProgressCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(UpdateCapaProgressCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.UpdateProgress(command.Request.CompletionPercent, command.Request.Notes);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Complete Implementation

public record CompleteCapaImplementationCommand(int Id) : IRequest<CorrectivePreventiveActionListDto>;

public class CompleteCapaImplementationCommandHandler : IRequestHandler<CompleteCapaImplementationCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteCapaImplementationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(CompleteCapaImplementationCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.CompleteImplementation();

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Verify CAPA

public record VerifyCapaCommand(int Id, VerifyCapaRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class VerifyCapaCommandHandler : IRequestHandler<VerifyCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public VerifyCapaCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(VerifyCapaCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.Verify(command.Request.Result, command.Request.VerifiedBy);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Evaluate Effectiveness

public record EvaluateCapaEffectivenessCommand(int Id, EvaluateCapaEffectivenessRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class EvaluateCapaEffectivenessCommandHandler : IRequestHandler<EvaluateCapaEffectivenessCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public EvaluateCapaEffectivenessCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(EvaluateCapaEffectivenessCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.EvaluateEffectiveness(command.Request.IsEffective, command.Request.Notes);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Close CAPA

public record CloseCapaCommand(int Id, CloseCapaRequest Request) : IRequest<CorrectivePreventiveActionListDto>;

public class CloseCapaCommandHandler : IRequestHandler<CloseCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CloseCapaCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(CloseCapaCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.Close(command.Request.ClosedBy, command.Request.ClosureNotes);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Cancel CAPA

public record CancelCapaCommand(int Id, string Reason) : IRequest<CorrectivePreventiveActionListDto>;

public class CancelCapaCommandHandler : IRequestHandler<CancelCapaCommand, CorrectivePreventiveActionListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelCapaCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionListDto> Handle(CancelCapaCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.Id}");

        capa.Cancel(command.Reason);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToListDto(capa);
    }
}

#endregion

#region Add Task

public record AddCapaTaskCommand(int CapaId, AddCapaTaskRequest Request) : IRequest<CapaTaskDto>;

public class AddCapaTaskCommandHandler : IRequestHandler<AddCapaTaskCommand, CapaTaskDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddCapaTaskCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CapaTaskDto> Handle(AddCapaTaskCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdWithDetailsAsync(command.CapaId, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.CapaId}");

        var task = capa.AddTask(
            command.Request.Description,
            command.Request.AssignedTo,
            command.Request.DueDate);

        task.SetSequenceNumber(capa.Tasks.Count);

        if (command.Request.AssignedUserId.HasValue)
            task.SetAssignedUser(command.Request.AssignedUserId);

        if (command.Request.EstimatedCost.HasValue)
            task.SetCost(command.Request.EstimatedCost, null);

        task.SetNotes(command.Request.Notes);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToTaskDto(task);
    }
}

#endregion

#region Complete Task

public record CompleteCapaTaskCommand(int CapaId, CompleteCapaTaskRequest Request) : IRequest<CapaTaskDto>;

public class CompleteCapaTaskCommandHandler : IRequestHandler<CompleteCapaTaskCommand, CapaTaskDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteCapaTaskCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CapaTaskDto> Handle(CompleteCapaTaskCommand command, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdWithDetailsAsync(command.CapaId, cancellationToken)
            ?? throw new KeyNotFoundException($"CAPA bulunamadı: {command.CapaId}");

        var task = capa.Tasks.FirstOrDefault(t => t.Id == command.Request.TaskId)
            ?? throw new KeyNotFoundException($"Görev bulunamadı: {command.Request.TaskId}");

        task.Complete(command.Request.Result, command.Request.ActualCost);

        _unitOfWork.CorrectivePreventiveActions.Update(capa);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CapaMapperExtensions.ToTaskDto(task);
    }
}

#endregion

#region Mapper

internal static class CapaMapperExtensions
{
    public static CorrectivePreventiveActionListDto ToListDto(CorrectivePreventiveAction capa) => new(
        capa.Id,
        capa.CapaNumber,
        capa.NonConformanceReportId,
        capa.NonConformanceReport?.NcrNumber,
        capa.Type,
        GetTypeText(capa.Type),
        capa.Status,
        GetStatusText(capa.Status),
        capa.Priority,
        GetPriorityText(capa.Priority),
        capa.Description,
        capa.ResponsiblePerson,
        capa.ResponsibleDepartment,
        capa.DueDate,
        capa.CompletionPercent,
        capa.EstimatedCost,
        capa.ClosedDate,
        capa.GetAgeDays(),
        capa.GetDaysUntilDue(),
        capa.IsOverdue(),
        capa.Tasks?.Count ?? 0,
        capa.Tasks?.Count(t => t.IsCompleted) ?? 0,
        capa.IsActive);

    public static CorrectivePreventiveActionDto ToDto(CorrectivePreventiveAction capa) => new(
        capa.Id,
        capa.CapaNumber,
        capa.NonConformanceReportId,
        capa.NonConformanceReport?.NcrNumber,
        capa.Type,
        GetTypeText(capa.Type),
        capa.Status,
        GetStatusText(capa.Status),
        capa.Priority,
        GetPriorityText(capa.Priority),
        capa.Description,
        capa.ObjectiveStatement,
        capa.ScopeDefinition,
        capa.ResponsiblePerson,
        capa.ResponsibleUserId,
        capa.ResponsibleDepartment,
        capa.DueDate,
        capa.PlannedStartDate,
        capa.PlannedEndDate,
        capa.ActualStartDate,
        capa.ActualEndDate,
        capa.CompletionPercent,
        capa.RootCauseCategory,
        capa.RootCauseDescription,
        capa.ActionPlan,
        capa.ImplementationNotes,
        capa.ResourcesRequired,
        capa.EstimatedCost,
        capa.ActualCost,
        capa.VerificationMethod,
        capa.VerificationResult,
        capa.VerifiedBy,
        capa.VerificationDate,
        capa.IsEffective,
        capa.EffectivenessNotes,
        capa.EffectivenessReviewDate,
        capa.ClosedDate,
        capa.ClosedBy,
        capa.ClosureNotes,
        capa.Notes,
        capa.Attachments,
        capa.CreatedBy,
        capa.CreatedDate,
        capa.IsActive,
        capa.GetAgeDays(),
        capa.GetDaysUntilDue(),
        capa.IsOverdue(),
        capa.Tasks?.Select(ToTaskDto).ToList());

    public static CapaTaskDto ToTaskDto(CapaTask task) => new(
        task.Id,
        task.CorrectivePreventiveActionId,
        task.SequenceNumber,
        task.Description,
        task.AssignedTo,
        task.AssignedUserId,
        task.DueDate,
        task.CompletedDate,
        task.IsCompleted,
        task.Result,
        task.Notes,
        task.EstimatedCost,
        task.ActualCost);

    private static string GetTypeText(CapaType type) => type switch
    {
        CapaType.DüzelticiAksiyon => "Düzeltici Aksiyon",
        CapaType.ÖnleyiciAksiyon => "Önleyici Aksiyon",
        _ => type.ToString()
    };

    private static string GetStatusText(CapaStatus status) => status switch
    {
        CapaStatus.Taslak => "Taslak",
        CapaStatus.Açık => "Açık",
        CapaStatus.Planlama => "Planlama",
        CapaStatus.Uygulama => "Uygulama",
        CapaStatus.Doğrulama => "Doğrulama",
        CapaStatus.EtkinlikDeğerlendirme => "Etkinlik Değerlendirme",
        CapaStatus.Kapatıldı => "Kapatıldı",
        CapaStatus.İptal => "İptal",
        _ => status.ToString()
    };

    private static string GetPriorityText(CapaPriority priority) => priority switch
    {
        CapaPriority.Düşük => "Düşük",
        CapaPriority.Normal => "Normal",
        CapaPriority.Yüksek => "Yüksek",
        CapaPriority.Acil => "Acil",
        _ => priority.ToString()
    };
}

#endregion
