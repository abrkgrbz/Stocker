using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.NonConformanceReports.Commands;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.NonConformanceReports.Queries;

#region Get NCR By Id

public record GetNcrByIdQuery(int Id) : IRequest<NonConformanceReportDto?>;

public class GetNcrByIdQueryHandler : IRequestHandler<GetNcrByIdQuery, NonConformanceReportDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NonConformanceReportDto?> Handle(GetNcrByIdQuery request, CancellationToken cancellationToken)
    {
        var ncr = await _unitOfWork.NonConformanceReports.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return ncr != null ? NcrMapper.ToDto(ncr) : null;
    }
}

#endregion

#region Get All NCRs

public record GetAllNcrsQuery : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetAllNcrsQueryHandler : IRequestHandler<GetAllNcrsQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetAllNcrsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetAllNcrsQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetAllAsync(cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Status

public record GetNcrsByStatusQuery(NcrStatus Status) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsByStatusQueryHandler : IRequestHandler<GetNcrsByStatusQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsByStatusQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsByStatusQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetByStatusAsync(request.Status, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Open NCRs

public record GetOpenNcrsQuery : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetOpenNcrsQueryHandler : IRequestHandler<GetOpenNcrsQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetOpenNcrsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetOpenNcrsQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetOpenNcrsAsync(cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Source

public record GetNcrsBySourceQuery(NcrSource Source) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsBySourceQueryHandler : IRequestHandler<GetNcrsBySourceQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsBySourceQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsBySourceQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetBySourceAsync(request.Source, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Severity

public record GetNcrsBySeverityQuery(NcrSeverity Severity) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsBySeverityQueryHandler : IRequestHandler<GetNcrsBySeverityQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsBySeverityQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsBySeverityQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetBySeverityAsync(request.Severity, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Product

public record GetNcrsByProductQuery(int ProductId) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsByProductQueryHandler : IRequestHandler<GetNcrsByProductQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsByProductQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsByProductQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetByProductAsync(request.ProductId, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Production Order

public record GetNcrsByProductionOrderQuery(int ProductionOrderId) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsByProductionOrderQueryHandler : IRequestHandler<GetNcrsByProductionOrderQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsByProductionOrderQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsByProductionOrderQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetByProductionOrderAsync(request.ProductionOrderId, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Customer

public record GetNcrsByCustomerQuery(int CustomerId) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsByCustomerQueryHandler : IRequestHandler<GetNcrsByCustomerQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsByCustomerQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsByCustomerQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetByCustomerAsync(request.CustomerId, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Supplier

public record GetNcrsBySupplierQuery(int SupplierId) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsBySupplierQueryHandler : IRequestHandler<GetNcrsBySupplierQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsBySupplierQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsBySupplierQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetBySupplierAsync(request.SupplierId, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCRs By Date Range

public record GetNcrsByDateRangeQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<NonConformanceReportListDto>>;

public class GetNcrsByDateRangeQueryHandler : IRequestHandler<GetNcrsByDateRangeQuery, IReadOnlyList<NonConformanceReportListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrsByDateRangeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NonConformanceReportListDto>> Handle(GetNcrsByDateRangeQuery request, CancellationToken cancellationToken)
    {
        var ncrs = await _unitOfWork.NonConformanceReports.GetByDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);
        return ncrs.Select(NcrMapper.ToListDto).ToList();
    }
}

#endregion

#region Get NCR Statistics

public record GetNcrStatisticsQuery(DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<NcrStatisticsDto>;

public class GetNcrStatisticsQueryHandler : IRequestHandler<GetNcrStatisticsQuery, NcrStatisticsDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetNcrStatisticsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NcrStatisticsDto> Handle(GetNcrStatisticsQuery request, CancellationToken cancellationToken)
    {
        var startDate = request.StartDate ?? DateTime.UtcNow.AddYears(-1);
        var endDate = request.EndDate ?? DateTime.UtcNow;

        var ncrs = await _unitOfWork.NonConformanceReports.GetByDateRangeAsync(startDate, endDate, cancellationToken);
        var ncrList = ncrs.ToList();

        var totalCount = ncrList.Count;
        var openCount = ncrList.Count(n => n.Status != NcrStatus.Kapatıldı && n.Status != NcrStatus.İptal);
        var closedCount = ncrList.Count(n => n.Status == NcrStatus.Kapatıldı);
        var cancelledCount = ncrList.Count(n => n.Status == NcrStatus.İptal);

        var closedNcrs = ncrList.Where(n => n.Status == NcrStatus.Kapatıldı && n.ClosedDate.HasValue).ToList();
        var avgResolution = closedNcrs.Any()
            ? (decimal)closedNcrs.Average(n => (n.ClosedDate!.Value - n.DetectionDate).TotalDays)
            : 0;

        var bySource = Enum.GetValues<NcrSource>()
            .Select(s => new NcrBySourceDto(s, GetSourceText(s), ncrList.Count(n => n.Source == s)))
            .Where(x => x.Count > 0)
            .ToList();

        var bySeverity = Enum.GetValues<NcrSeverity>()
            .Select(s => new NcrBySeverityDto(s, GetSeverityText(s), ncrList.Count(n => n.Severity == s)))
            .Where(x => x.Count > 0)
            .ToList();

        var byDisposition = Enum.GetValues<NcrDisposition>()
            .Select(d => new NcrByDispositionDto(d, GetDispositionText(d), ncrList.Count(n => n.Disposition == d)))
            .Where(x => x.Count > 0)
            .ToList();

        var byMonth = ncrList
            .GroupBy(n => new { n.DetectionDate.Year, n.DetectionDate.Month })
            .Select(g => new NcrByMonthDto(g.Key.Year, g.Key.Month, g.Count()))
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToList();

        return new NcrStatisticsDto(
            totalCount, openCount, closedCount, cancelledCount, avgResolution,
            bySource, bySeverity, byDisposition, byMonth);
    }

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

#endregion
