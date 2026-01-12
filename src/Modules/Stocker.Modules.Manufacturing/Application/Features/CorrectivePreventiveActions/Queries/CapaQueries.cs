using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.CorrectivePreventiveActions.Commands;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CorrectivePreventiveActions.Queries;

#region Get CAPA By Id

public record GetCapaByIdQuery(int Id) : IRequest<CorrectivePreventiveActionDto?>;

public class GetCapaByIdQueryHandler : IRequestHandler<GetCapaByIdQuery, CorrectivePreventiveActionDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapaByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CorrectivePreventiveActionDto?> Handle(GetCapaByIdQuery request, CancellationToken cancellationToken)
    {
        var capa = await _unitOfWork.CorrectivePreventiveActions.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return capa != null ? CapaMapperExtensions.ToDto(capa) : null;
    }
}

#endregion

#region Get All CAPAs

public record GetAllCapasQuery : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetAllCapasQueryHandler : IRequestHandler<GetAllCapasQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetAllCapasQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetAllCapasQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetAllAsync(cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPAs By Status

public record GetCapasByStatusQuery(CapaStatus Status) : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetCapasByStatusQueryHandler : IRequestHandler<GetCapasByStatusQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapasByStatusQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetCapasByStatusQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetByStatusAsync(request.Status, cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get Open CAPAs

public record GetOpenCapasQuery : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetOpenCapasQueryHandler : IRequestHandler<GetOpenCapasQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOpenCapasQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetOpenCapasQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetOpenCapasAsync(cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get Overdue CAPAs

public record GetOverdueCapasQuery : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetOverdueCapasQueryHandler : IRequestHandler<GetOverdueCapasQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOverdueCapasQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetOverdueCapasQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetOverdueCapasAsync(cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPAs By Type

public record GetCapasByTypeQuery(CapaType Type) : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetCapasByTypeQueryHandler : IRequestHandler<GetCapasByTypeQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapasByTypeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetCapasByTypeQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetByTypeAsync(request.Type, cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPAs By NCR

public record GetCapasByNcrQuery(int NcrId) : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetCapasByNcrQueryHandler : IRequestHandler<GetCapasByNcrQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapasByNcrQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetCapasByNcrQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetByNcrIdAsync(request.NcrId, cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPAs By Responsible User

public record GetCapasByResponsibleUserQuery(int UserId) : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetCapasByResponsibleUserQueryHandler : IRequestHandler<GetCapasByResponsibleUserQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapasByResponsibleUserQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetCapasByResponsibleUserQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetByResponsibleUserAsync(request.UserId, cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPAs By Due Date Range

public record GetCapasByDueDateRangeQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<CorrectivePreventiveActionListDto>>;

public class GetCapasByDueDateRangeQueryHandler : IRequestHandler<GetCapasByDueDateRangeQuery, IReadOnlyList<CorrectivePreventiveActionListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapasByDueDateRangeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CorrectivePreventiveActionListDto>> Handle(GetCapasByDueDateRangeQuery request, CancellationToken cancellationToken)
    {
        var capas = await _unitOfWork.CorrectivePreventiveActions.GetByDueDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);
        return capas.Select(CapaMapperExtensions.ToListDto).ToList();
    }
}

#endregion

#region Get CAPA Statistics

public record GetCapaStatisticsQuery(DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<CapaStatisticsDto>;

public class GetCapaStatisticsQueryHandler : IRequestHandler<GetCapaStatisticsQuery, CapaStatisticsDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCapaStatisticsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CapaStatisticsDto> Handle(GetCapaStatisticsQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.StartDate ?? DateTime.UtcNow.AddYears(-1);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        var allCapas = await _unitOfWork.CorrectivePreventiveActions.GetAllAsync(cancellationToken);
        var capaList = allCapas.Where(c => c.CreatedDate >= startDate && c.CreatedDate <= endDate).ToList();

        var totalCount = capaList.Count;
        var openCount = capaList.Count(c => c.Status != CapaStatus.Kapatıldı && c.Status != CapaStatus.İptal);
        var closedCount = capaList.Count(c => c.Status == CapaStatus.Kapatıldı);
        var overdueCount = capaList.Count(c => c.IsOverdue());

        var closedCapas = capaList.Where(c => c.Status == CapaStatus.Kapatıldı && c.ClosedDate.HasValue).ToList();
        var avgResolution = closedCapas.Any()
            ? (decimal)closedCapas.Average(c => (c.ClosedDate!.Value - c.CreatedDate).TotalDays)
            : 0;

        var effectiveCapas = closedCapas.Count(c => c.IsEffective == true);
        var effectivenessRate = closedCapas.Any() ? (decimal)effectiveCapas / closedCapas.Count * 100 : 0;

        var byType = Enum.GetValues<CapaType>()
            .Select(t => new CapaByTypeDto(t, GetTypeText(t), capaList.Count(c => c.Type == t)))
            .Where(x => x.Count > 0)
            .ToList();

        var byStatus = Enum.GetValues<CapaStatus>()
            .Select(s => new CapaByStatusDto(s, GetStatusText(s), capaList.Count(c => c.Status == s)))
            .Where(x => x.Count > 0)
            .ToList();

        var byPriority = Enum.GetValues<CapaPriority>()
            .Select(p => new CapaByPriorityDto(p, GetPriorityText(p), capaList.Count(c => c.Priority == p)))
            .Where(x => x.Count > 0)
            .ToList();

        return new CapaStatisticsDto(
            totalCount, openCount, closedCount, overdueCount,
            avgResolution, effectivenessRate,
            byType, byStatus, byPriority);
    }

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
