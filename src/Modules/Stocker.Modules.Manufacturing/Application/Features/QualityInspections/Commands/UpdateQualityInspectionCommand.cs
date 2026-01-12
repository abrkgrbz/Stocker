using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.QualityInspections.Commands;

public record StartInspectionCommand(Guid Id, StartInspectionRequest Request) : IRequest;

public class StartInspectionCommandHandler : IRequestHandler<StartInspectionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartInspectionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(StartInspectionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        inspection.StartInspection();

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record RecordInspectionResultCommand(Guid Id, RecordInspectionResultRequest Request) : IRequest;

public class RecordInspectionResultCommandHandler : IRequestHandler<RecordInspectionResultCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public RecordInspectionResultCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RecordInspectionResultCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        inspection.RecordDefects(request.CriticalDefects, request.MajorDefects, request.MinorDefects);
        inspection.SetResult(request.Result, request.AcceptedQuantity, request.RejectedQuantity);

        if (!string.IsNullOrEmpty(request.MeasurementResults))
        {
            inspection.RecordMeasurements(request.MeasurementResults);
        }

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record RecordNonConformanceCommand(Guid Id, RecordNonConformanceRequest Request) : IRequest;

public class RecordNonConformanceCommandHandler : IRequestHandler<RecordNonConformanceCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public RecordNonConformanceCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RecordNonConformanceCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        inspection.RecordNonConformance(request.Description, request.CorrectiveAction, request.PreventiveAction);

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record SetDispositionCommand(Guid Id, SetDispositionRequest Request) : IRequest;

public class SetDispositionCommandHandler : IRequestHandler<SetDispositionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public SetDispositionCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(SetDispositionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");
        var request = command.Request;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        inspection.SetDisposition(request.Decision, request.Reason, userId);

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record CompleteInspectionCommand(Guid Id) : IRequest;

public class CompleteInspectionCommandHandler : IRequestHandler<CompleteInspectionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CompleteInspectionCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteInspectionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        inspection.Complete(userId);

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record GenerateCertificateCommand(Guid Id) : IRequest<string>;

public class GenerateCertificateCommandHandler : IRequestHandler<GenerateCertificateCommand, string>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GenerateCertificateCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<string> Handle(GenerateCertificateCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı güncelleme yetkiniz yok.");

        var certificateNumber = $"CERT-{DateTime.UtcNow:yyMMdd}-{inspection.InspectionNumber}";
        inspection.GenerateCertificate(certificateNumber);

        _unitOfWork.QualityInspections.Update(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return certificateNumber;
    }
}

public record DeleteQualityInspectionCommand(Guid Id) : IRequest;

public class DeleteQualityInspectionCommandHandler : IRequestHandler<DeleteQualityInspectionCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteQualityInspectionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteQualityInspectionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var inspection = await _unitOfWork.QualityInspections.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan kalite denetimi bulunamadı.");

        if (inspection.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı silme yetkiniz yok.");

        if (inspection.Status == "Tamamlandı")
            throw new InvalidOperationException("Tamamlanmış denetim silinemez.");

        _unitOfWork.QualityInspections.Delete(inspection);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
