using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.NonConformanceReports.Commands;

#region Create NCR

public record CreateNcrCommand(CreateNcrRequest Request) : IRequest<NonConformanceReportListDto>;

public class CreateNcrCommandValidator : AbstractValidator<CreateNcrCommand>
{
    public CreateNcrCommandValidator()
    {
        RuleFor(x => x.Request.ProductId)
            .GreaterThan(0).WithMessage("Ürün seçimi zorunludur.");

        RuleFor(x => x.Request.Title)
            .NotEmpty().WithMessage("Başlık zorunludur.")
            .MaximumLength(200).WithMessage("Başlık en fazla 200 karakter olabilir.");

        RuleFor(x => x.Request.Description)
            .NotEmpty().WithMessage("Açıklama zorunludur.")
            .MaximumLength(2000).WithMessage("Açıklama en fazla 2000 karakter olabilir.");

        RuleFor(x => x.Request.AffectedQuantity)
            .GreaterThan(0).WithMessage("Etkilenen miktar sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.Source)
            .IsInEnum().WithMessage("Geçerli bir kaynak seçiniz.");

        RuleFor(x => x.Request.Severity)
            .IsInEnum().WithMessage("Geçerli bir şiddet seviyesi seçiniz.");
    }
}

public class CreateNcrCommandHandler : IRequestHandler<CreateNcrCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateNcrCommandHandler(IManufacturingUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<NonConformanceReportListDto> Handle(CreateNcrCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var request = command.Request;

        var ncrNumber = await _unitOfWork.NonConformanceReports.GenerateNcrNumberAsync(cancellationToken);

        var ncr = new NonConformanceReport(
            ncrNumber,
            request.ProductId,
            request.Title,
            request.Description,
            request.Source,
            request.Severity,
            request.AffectedQuantity);

        ncr.SetTenantId(tenantId);
        ncr.SetProductInfo(request.ProductCode, request.ProductName, request.Unit);

        if (!string.IsNullOrEmpty(request.LotNumber) || !string.IsNullOrEmpty(request.SerialNumber))
            ncr.SetLotSerialInfo(request.LotNumber, request.SerialNumber);

        if (request.ProductionOrderId.HasValue)
            ncr.SetProductionReference(request.ProductionOrderId, request.ProductionOperationId);

        if (request.QualityInspectionId.HasValue)
            ncr.SetQualityInspectionReference(request.QualityInspectionId.Value);

        ncr.SetLocation(request.WorkCenterId, request.WarehouseId, request.DetectionLocation);
        ncr.SetDefectDetails(request.DefectType, request.DefectCode, request.SpecificationReference);
        ncr.SetMeasurementDeviation(request.ActualValue, request.ExpectedValue);
        ncr.SetCustomerInfo(request.CustomerId, request.CustomerName, request.CustomerNotificationRequired);
        ncr.SetSupplierInfo(request.SupplierId, request.SupplierName);

        if (request.EstimatedCost.HasValue)
            ncr.SetCost(request.EstimatedCost, null, null);

        ncr.SetDetectedBy(_currentUser.UserName ?? "Sistem", _currentUser.UserId.HasValue ? (int?)int.Parse(_currentUser.UserId.Value.ToString()) : null);
        ncr.SetCreatedBy(_currentUser.UserName ?? "Sistem");
        ncr.SetNotes(request.Notes);

        await _unitOfWork.NonConformanceReports.AddAsync(ncr, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Update NCR

public record UpdateNcrCommand(int Id, UpdateNcrRequest Request) : IRequest<NonConformanceReportListDto>;

public class UpdateNcrCommandHandler : IRequestHandler<UpdateNcrCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateNcrCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(UpdateNcrCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        // Only allow updates for open NCRs
        if (ncr.Status == NcrStatus.Kapatıldı || ncr.Status == NcrStatus.İptal)
            throw new InvalidOperationException("Kapatılmış veya iptal edilmiş NCR güncellenemez.");

        // Update fields via reflection or specific methods as needed
        // Note: Entity uses private setters, so we'd need to add update methods to the entity
        ncr.SetDefectDetails(command.Request.DefectType, command.Request.DefectCode, command.Request.SpecificationReference);
        ncr.SetMeasurementDeviation(command.Request.ActualValue, command.Request.ExpectedValue);

        if (command.Request.EstimatedCost.HasValue)
            ncr.SetCost(command.Request.EstimatedCost, null, null);

        ncr.SetNotes(command.Request.Notes);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Start Investigation

public record StartNcrInvestigationCommand(int Id, StartNcrInvestigationRequest Request) : IRequest<NonConformanceReportListDto>;

public class StartNcrInvestigationCommandHandler : IRequestHandler<StartNcrInvestigationCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartNcrInvestigationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(StartNcrInvestigationCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.StartInvestigation(command.Request.InvestigatedBy);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Complete Investigation

public record CompleteNcrInvestigationCommand(int Id) : IRequest<NonConformanceReportListDto>;

public class CompleteNcrInvestigationCommandHandler : IRequestHandler<CompleteNcrInvestigationCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteNcrInvestigationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(CompleteNcrInvestigationCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.CompleteInvestigation();

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Set Root Cause

public record SetNcrRootCauseCommand(int Id, SetNcrRootCauseRequest Request) : IRequest<NonConformanceReportListDto>;

public class SetNcrRootCauseCommandHandler : IRequestHandler<SetNcrRootCauseCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetNcrRootCauseCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(SetNcrRootCauseCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.SetRootCause(command.Request.Category, command.Request.Description);

        if (!string.IsNullOrEmpty(command.Request.FiveWhyAnalysisJson))
            ncr.SetFiveWhyAnalysis(command.Request.FiveWhyAnalysisJson);

        if (!string.IsNullOrEmpty(command.Request.IshikawaDiagramJson))
            ncr.SetIshikawaDiagram(command.Request.IshikawaDiagramJson);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Set Disposition

public record SetNcrDispositionCommand(int Id, SetNcrDispositionRequest Request) : IRequest<NonConformanceReportListDto>;

public class SetNcrDispositionCommandHandler : IRequestHandler<SetNcrDispositionCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetNcrDispositionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(SetNcrDispositionCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.SetDisposition(command.Request.Disposition, command.Request.Reason, command.Request.ApprovedBy);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Add Containment Action

public record AddNcrContainmentActionCommand(int NcrId, AddNcrContainmentActionRequest Request) : IRequest<NcrContainmentActionDto>;

public class AddNcrContainmentActionCommandHandler : IRequestHandler<AddNcrContainmentActionCommand, NcrContainmentActionDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddNcrContainmentActionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NcrContainmentActionDto> Handle(AddNcrContainmentActionCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdWithDetailsAsync(command.NcrId, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.NcrId}");

        var containment = ncr.AddContainmentAction(
            command.Request.Action,
            command.Request.ResponsiblePerson,
            command.Request.DueDate);

        if (!string.IsNullOrEmpty(command.Request.Notes))
            containment.SetNotes(command.Request.Notes);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToContainmentDto(containment);
    }
}

#endregion

#region Complete Containment Action

public record CompleteNcrContainmentActionCommand(int NcrId, CompleteNcrContainmentActionRequest Request) : IRequest<NcrContainmentActionDto>;

public class CompleteNcrContainmentActionCommandHandler : IRequestHandler<CompleteNcrContainmentActionCommand, NcrContainmentActionDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteNcrContainmentActionCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NcrContainmentActionDto> Handle(CompleteNcrContainmentActionCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdWithDetailsAsync(command.NcrId, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.NcrId}");

        var containment = ncr.ContainmentActions.FirstOrDefault(c => c.Id == command.Request.ContainmentActionId)
            ?? throw new KeyNotFoundException($"İvedi önlem bulunamadı: {command.Request.ContainmentActionId}");

        containment.Complete(command.Request.Result);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToContainmentDto(containment);
    }
}

#endregion

#region Close NCR

public record CloseNcrCommand(int Id, CloseNcrRequest Request) : IRequest<NonConformanceReportListDto>;

public class CloseNcrCommandHandler : IRequestHandler<CloseNcrCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CloseNcrCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(CloseNcrCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.Close(command.Request.ClosedBy, command.Request.ClosureNotes);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Cancel NCR

public record CancelNcrCommand(int Id, string Reason) : IRequest<NonConformanceReportListDto>;

public class CancelNcrCommandHandler : IRequestHandler<CancelNcrCommand, NonConformanceReportListDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CancelNcrCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportListDto> Handle(CancelNcrCommand command, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"NCR bulunamadı: {command.Id}");

        ncr.Cancel(command.Reason);

        _unitOfWork.NonConformanceReports.Update(ncr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NcrMapper.ToListDto(ncr);
    }
}

#endregion

#region Mapper

internal static class NcrMapper
{
    public static NonConformanceReportListDto ToListDto(NonConformanceReport ncr) => new(
        ncr.Id,
        ncr.NcrNumber,
        ncr.Status,
        GetStatusText(ncr.Status),
        ncr.Source,
        GetSourceText(ncr.Source),
        ncr.Severity,
        GetSeverityText(ncr.Severity),
        ncr.ProductId,
        ncr.ProductCode,
        ncr.ProductName,
        ncr.AffectedQuantity,
        ncr.Unit,
        ncr.Title,
        ncr.DetectionDate,
        ncr.DetectedBy,
        ncr.Disposition,
        ncr.Disposition.HasValue ? GetDispositionText(ncr.Disposition.Value) : null,
        ncr.CustomerId,
        ncr.CustomerName,
        ncr.SupplierId,
        ncr.SupplierName,
        ncr.EstimatedCost,
        ncr.ClosedDate,
        ncr.GetAgeDays(),
        ncr.ContainmentActions?.Count ?? 0,
        ncr.CapaActions?.Count ?? 0,
        ncr.IsActive);

    public static NcrContainmentActionDto ToContainmentDto(NcrContainmentAction action) => new(
        action.Id,
        action.NonConformanceReportId,
        action.Action,
        action.ResponsiblePerson,
        action.DueDate,
        action.CompletedDate,
        action.IsCompleted,
        action.Result,
        action.Notes);

    public static NonConformanceReportDto ToDto(NonConformanceReport ncr) => new(
        ncr.Id,
        ncr.NcrNumber,
        ncr.Status,
        ncr.Source,
        ncr.Severity,
        ncr.ProductionOrderId,
        null, // ProductionOrderNumber
        ncr.ProductionOperationId,
        ncr.QualityInspectionId,
        ncr.PurchaseOrderId,
        ncr.SalesOrderId,
        ncr.ProductId,
        ncr.ProductCode,
        ncr.ProductName,
        ncr.LotNumber,
        ncr.SerialNumber,
        ncr.AffectedQuantity,
        ncr.Unit,
        ncr.WorkCenterId,
        null, // WorkCenterName
        ncr.WarehouseId,
        ncr.DetectionLocation,
        ncr.Title,
        ncr.Description,
        ncr.DefectType,
        ncr.DefectCode,
        ncr.SpecificationReference,
        ncr.ActualValue,
        ncr.ExpectedValue,
        ncr.DetectionDate,
        ncr.DetectedBy,
        ncr.DetectedByUserId,
        ncr.InvestigationNotes,
        ncr.InvestigationStartDate,
        ncr.InvestigationEndDate,
        ncr.InvestigatedBy,
        ncr.RootCauseCategory,
        ncr.RootCauseDescription,
        ncr.FiveWhyAnalysis,
        ncr.IshikawaDiagram,
        ncr.Disposition,
        ncr.DispositionReason,
        ncr.DispositionApprovedBy,
        ncr.DispositionDate,
        ncr.CustomerId,
        ncr.CustomerName,
        ncr.SupplierId,
        ncr.SupplierName,
        ncr.CustomerNotificationRequired,
        ncr.CustomerNotified,
        ncr.CustomerNotificationDate,
        ncr.EstimatedCost,
        ncr.ActualCost,
        ncr.CostBreakdown,
        ncr.ClosedDate,
        ncr.ClosedBy,
        ncr.ClosureNotes,
        ncr.Notes,
        ncr.Attachments,
        ncr.CreatedBy,
        ncr.CreatedDate,
        ncr.IsActive,
        ncr.GetAgeDays(),
        ncr.ContainmentActions?.Select(ToContainmentDto).ToList(),
        ncr.CapaActions?.Select(CapaMapper.ToListDto).ToList());

    private static string GetStatusText(NcrStatus status) => status switch
    {
        NcrStatus.Taslak => "Taslak",
        NcrStatus.Açık => "Açık",
        NcrStatus.Araştırılıyor => "Araştırılıyor",
        NcrStatus.KökNedenAnalizi => "Kök Neden Analizi",
        NcrStatus.DüzelticiAksiyonBekleniyor => "Düzeltici Aksiyon Bekleniyor",
        NcrStatus.DoğrulamaBekleniyor => "Doğrulama Bekleniyor",
        NcrStatus.Kapatıldı => "Kapatıldı",
        NcrStatus.İptal => "İptal",
        _ => status.ToString()
    };

    private static string GetSourceText(NcrSource source) => source switch
    {
        NcrSource.ÜretimHattı => "Üretim Hattı",
        NcrSource.GirdiKontrol => "Girdi Kontrol",
        NcrSource.ProsesKontrol => "Proses Kontrol",
        NcrSource.FinalKontrol => "Final Kontrol",
        NcrSource.MüşteriŞikayeti => "Müşteri Şikayeti",
        NcrSource.İçDenetim => "İç Denetim",
        NcrSource.TedarikçiDenetim => "Tedarikçi Denetim",
        NcrSource.Sahaİadesi => "Saha İadesi",
        _ => source.ToString()
    };

    private static string GetSeverityText(NcrSeverity severity) => severity switch
    {
        NcrSeverity.Minör => "Minör",
        NcrSeverity.Majör => "Majör",
        NcrSeverity.Kritik => "Kritik",
        NcrSeverity.Güvenlik => "Güvenlik",
        _ => severity.ToString()
    };

    private static string GetDispositionText(NcrDisposition disposition) => disposition switch
    {
        NcrDisposition.Kabul => "Kabul",
        NcrDisposition.ŞartlıKabul => "Şartlı Kabul",
        NcrDisposition.YenidenİşleRework => "Yeniden İşle (Rework)",
        NcrDisposition.TamirRepair => "Tamir (Repair)",
        NcrDisposition.HurdalıkScrap => "Hurdalık (Scrap)",
        NcrDisposition.İade => "İade",
        NcrDisposition.SınıflandırmaDegrade => "Sınıflandırma (Degrade)",
        NcrDisposition.MüşteriFesih => "Müşteri Fesih",
        _ => disposition.ToString()
    };
}

internal static class CapaMapper
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

    public static string GetTypeText(CapaType type) => type switch
    {
        CapaType.DüzelticiAksiyon => "Düzeltici Aksiyon",
        CapaType.ÖnleyiciAksiyon => "Önleyici Aksiyon",
        _ => type.ToString()
    };

    public static string GetStatusText(CapaStatus status) => status switch
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

    public static string GetPriorityText(CapaPriority priority) => priority switch
    {
        CapaPriority.Düşük => "Düşük",
        CapaPriority.Normal => "Normal",
        CapaPriority.Yüksek => "Yüksek",
        CapaPriority.Acil => "Acil",
        _ => priority.ToString()
    };
}

#endregion
