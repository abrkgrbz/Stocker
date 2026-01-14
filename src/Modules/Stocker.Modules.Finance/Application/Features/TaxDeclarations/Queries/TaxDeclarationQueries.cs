using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.TaxDeclarations.Queries;

/// <summary>
/// Query to get paginated tax declarations
/// </summary>
public class GetTaxDeclarationsQuery : IRequest<Result<PagedResult<TaxDeclarationSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public TaxDeclarationFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetTaxDeclarationsQuery
/// </summary>
public class GetTaxDeclarationsQueryHandler : IRequestHandler<GetTaxDeclarationsQuery, Result<PagedResult<TaxDeclarationSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetTaxDeclarationsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<TaxDeclarationSummaryDto>>> Handle(GetTaxDeclarationsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.TaxDeclarations.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(d =>
                    d.DeclarationNumber.ToLower().Contains(searchTerm) ||
                    (d.GibApprovalNumber != null && d.GibApprovalNumber.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.DeclarationType.HasValue)
            {
                query = query.Where(d => d.DeclarationType == request.Filter.DeclarationType.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(d => d.Status == request.Filter.Status.Value);
            }

            if (request.Filter.TaxYear.HasValue)
            {
                query = query.Where(d => d.TaxYear == request.Filter.TaxYear.Value);
            }

            if (request.Filter.TaxMonth.HasValue)
            {
                query = query.Where(d => d.TaxMonth == request.Filter.TaxMonth.Value);
            }

            if (request.Filter.TaxQuarter.HasValue)
            {
                query = query.Where(d => d.TaxQuarter == request.Filter.TaxQuarter.Value);
            }

            if (request.Filter.IsAmendment.HasValue)
            {
                query = query.Where(d => d.IsAmendment == request.Filter.IsAmendment.Value);
            }

            if (request.Filter.IsOverdue.HasValue && request.Filter.IsOverdue.Value)
            {
                var today = DateTime.Today;
                query = query.Where(d =>
                    d.FilingDeadline < today &&
                    d.Status != TaxDeclarationStatus.Filed &&
                    d.Status != TaxDeclarationStatus.Paid &&
                    d.Status != TaxDeclarationStatus.Cancelled);
            }

            if (request.Filter.HasUnpaidBalance.HasValue && request.Filter.HasUnpaidBalance.Value)
            {
                query = query.Where(d => d.RemainingBalance.Amount > 0);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "TaxYear";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "declarationnumber" => sortDesc ? query.OrderByDescending(d => d.DeclarationNumber) : query.OrderBy(d => d.DeclarationNumber),
            "declarationtype" => sortDesc ? query.OrderByDescending(d => d.DeclarationType) : query.OrderBy(d => d.DeclarationType),
            "status" => sortDesc ? query.OrderByDescending(d => d.Status) : query.OrderBy(d => d.Status),
            "filingdeadline" => sortDesc ? query.OrderByDescending(d => d.FilingDeadline) : query.OrderBy(d => d.FilingDeadline),
            "nettax" => sortDesc ? query.OrderByDescending(d => d.NetTax.Amount) : query.OrderBy(d => d.NetTax.Amount),
            _ => sortDesc
                ? query.OrderByDescending(d => d.TaxYear).ThenByDescending(d => d.TaxMonth ?? d.TaxQuarter ?? 0)
                : query.OrderBy(d => d.TaxYear).ThenBy(d => d.TaxMonth ?? d.TaxQuarter ?? 0)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var declarations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = declarations.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<TaxDeclarationSummaryDto>>.Success(
            new PagedResult<TaxDeclarationSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static TaxDeclarationSummaryDto MapToSummaryDto(TaxDeclaration declaration)
    {
        var today = DateTime.Today;

        return new TaxDeclarationSummaryDto
        {
            Id = declaration.Id,
            DeclarationNumber = declaration.DeclarationNumber,
            DeclarationType = declaration.DeclarationType,
            DeclarationTypeName = GetDeclarationTypeName(declaration.DeclarationType),
            TaxYear = declaration.TaxYear,
            TaxMonth = declaration.TaxMonth,
            TaxQuarter = declaration.TaxQuarter,
            PeriodDisplay = GetPeriodDisplay(declaration),
            FilingDeadline = declaration.FilingDeadline,
            PaymentDeadline = declaration.PaymentDeadline,
            NetTax = declaration.NetTax.Amount,
            PaidAmount = declaration.PaidAmount.Amount,
            RemainingBalance = declaration.RemainingBalance.Amount,
            Currency = declaration.NetTax.Currency,
            Status = declaration.Status,
            StatusName = GetStatusName(declaration.Status),
            IsAmendment = declaration.IsAmendment,
            IsOverdue = declaration.FilingDeadline < today &&
                       declaration.Status != TaxDeclarationStatus.Filed &&
                       declaration.Status != TaxDeclarationStatus.Paid &&
                       declaration.Status != TaxDeclarationStatus.Cancelled,
            IsPaymentOverdue = declaration.PaymentDeadline < today &&
                              declaration.RemainingBalance.Amount > 0
        };
    }

    private static string GetDeclarationTypeName(TaxDeclarationType type) => type switch
    {
        TaxDeclarationType.Kdv => "KDV Beyannamesi",
        TaxDeclarationType.Kdv2 => "KDV 2 Beyannamesi",
        TaxDeclarationType.Muhtasar => "Muhtasar Beyanname",
        TaxDeclarationType.MuhtasarPrimHizmet => "Muhtasar ve Prim Hizmet",
        TaxDeclarationType.GeciciVergi => "Geçici Vergi",
        TaxDeclarationType.KurumlarVergisi => "Kurumlar Vergisi",
        TaxDeclarationType.GelirVergisi => "Gelir Vergisi",
        TaxDeclarationType.DamgaVergisi => "Damga Vergisi",
        TaxDeclarationType.Otv => "ÖTV",
        TaxDeclarationType.VerasetIntikal => "Veraset ve İntikal Vergisi",
        _ => type.ToString()
    };

    private static string GetPeriodDisplay(TaxDeclaration declaration)
    {
        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        if (declaration.TaxMonth.HasValue)
        {
            return $"{monthNames[declaration.TaxMonth.Value]} {declaration.TaxYear}";
        }

        if (declaration.TaxQuarter.HasValue)
        {
            return $"{declaration.TaxQuarter}. Çeyrek {declaration.TaxYear}";
        }

        return declaration.TaxYear.ToString();
    }

    private static string GetStatusName(TaxDeclarationStatus status) => status switch
    {
        TaxDeclarationStatus.Draft => "Taslak",
        TaxDeclarationStatus.Ready => "Hazır",
        TaxDeclarationStatus.Approved => "Onaylandı",
        TaxDeclarationStatus.Filed => "Beyan Edildi",
        TaxDeclarationStatus.Paid => "Ödendi",
        TaxDeclarationStatus.PartiallyPaid => "Kısmi Ödendi",
        TaxDeclarationStatus.Overdue => "Gecikmiş",
        TaxDeclarationStatus.Cancelled => "İptal",
        _ => status.ToString()
    };
}

/// <summary>
/// Query to get a tax declaration by ID with details
/// </summary>
public class GetTaxDeclarationByIdQuery : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetTaxDeclarationByIdQuery
/// </summary>
public class GetTaxDeclarationByIdQueryHandler : IRequestHandler<GetTaxDeclarationByIdQuery, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetTaxDeclarationByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(GetTaxDeclarationByIdQuery request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        var dto = MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }

    internal static TaxDeclarationDto MapToDto(TaxDeclaration declaration)
    {
        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        string periodDisplay;
        if (declaration.TaxMonth.HasValue)
        {
            periodDisplay = $"{monthNames[declaration.TaxMonth.Value]} {declaration.TaxYear}";
        }
        else if (declaration.TaxQuarter.HasValue)
        {
            periodDisplay = $"{declaration.TaxQuarter}. Çeyrek {declaration.TaxYear}";
        }
        else
        {
            periodDisplay = declaration.TaxYear.ToString();
        }

        return new TaxDeclarationDto
        {
            Id = declaration.Id,
            DeclarationNumber = declaration.DeclarationNumber,
            DeclarationType = declaration.DeclarationType,
            DeclarationTypeName = GetDeclarationTypeName(declaration.DeclarationType),
            TaxYear = declaration.TaxYear,
            TaxMonth = declaration.TaxMonth,
            TaxQuarter = declaration.TaxQuarter,
            PeriodStart = declaration.PeriodStart,
            PeriodEnd = declaration.PeriodEnd,
            PeriodDisplay = periodDisplay,
            FilingDeadline = declaration.FilingDeadline,
            PaymentDeadline = declaration.PaymentDeadline,
            TaxBase = declaration.TaxBase.Amount,
            CalculatedTax = declaration.CalculatedTax.Amount,
            DeductibleTax = declaration.DeductibleTax?.Amount,
            CarriedForwardTax = declaration.CarriedForwardTax?.Amount,
            BroughtForwardTax = declaration.BroughtForwardTax?.Amount,
            DeferredTax = declaration.DeferredTax?.Amount,
            NetTax = declaration.NetTax.Amount,
            PaidAmount = declaration.PaidAmount.Amount,
            RemainingBalance = declaration.RemainingBalance.Amount,
            LateInterest = declaration.LateInterest?.Amount,
            LatePenalty = declaration.LatePenalty?.Amount,
            Currency = declaration.NetTax.Currency,
            Status = declaration.Status,
            StatusName = GetStatusName(declaration.Status),
            FilingDate = declaration.FilingDate,
            GibApprovalNumber = declaration.GibApprovalNumber,
            IsAmendment = declaration.IsAmendment,
            AmendedDeclarationId = declaration.AmendedDeclarationId,
            AmendmentSequence = declaration.AmendmentSequence,
            AmendmentReason = declaration.AmendmentReason,
            TaxOfficeCode = declaration.TaxOfficeCode,
            TaxOfficeName = declaration.TaxOfficeName,
            AccrualSlipNumber = declaration.AccrualSlipNumber,
            PreparedBy = declaration.PreparedBy,
            PreparationDate = declaration.PreparationDate,
            ApprovedBy = declaration.ApprovedBy,
            ApprovalDate = declaration.ApprovalDate,
            AccountId = declaration.AccountId,
            AccountingPeriodId = declaration.AccountingPeriodId,
            Notes = declaration.Notes,
            Details = declaration.Details.Select(d => new TaxDeclarationDetailDto
            {
                Id = d.Id,
                TaxDeclarationId = d.TaxDeclarationId,
                Code = d.Code,
                Description = d.Description,
                TaxBase = d.Amount.Amount,
                TaxRate = d.Rate,
                TaxAmount = d.TaxAmount?.Amount ?? 0,
                Currency = d.Amount.Currency,
                SequenceNumber = d.SequenceNumber
            }).ToList(),
            Payments = declaration.Payments.Select(p => new TaxDeclarationPaymentDto
            {
                Id = p.Id,
                TaxDeclarationId = p.TaxDeclarationId,
                PaymentDate = p.PaymentDate,
                Amount = p.Amount.Amount,
                Currency = p.Amount.Currency,
                PaymentMethod = p.PaymentMethod.ToString(),
                ReceiptNumber = p.ReceiptNumber,
                BankTransactionId = p.BankTransactionId,
                Notes = p.Notes
            }).ToList(),
            CreatedAt = declaration.CreatedDate,
            UpdatedAt = declaration.UpdatedDate
        };
    }

    private static string GetDeclarationTypeName(TaxDeclarationType type) => type switch
    {
        TaxDeclarationType.Kdv => "KDV Beyannamesi",
        TaxDeclarationType.Kdv2 => "KDV 2 Beyannamesi",
        TaxDeclarationType.Muhtasar => "Muhtasar Beyanname",
        TaxDeclarationType.MuhtasarPrimHizmet => "Muhtasar ve Prim Hizmet",
        TaxDeclarationType.GeciciVergi => "Geçici Vergi",
        TaxDeclarationType.KurumlarVergisi => "Kurumlar Vergisi",
        TaxDeclarationType.GelirVergisi => "Gelir Vergisi",
        TaxDeclarationType.DamgaVergisi => "Damga Vergisi",
        TaxDeclarationType.Otv => "ÖTV",
        TaxDeclarationType.VerasetIntikal => "Veraset ve İntikal Vergisi",
        _ => type.ToString()
    };

    private static string GetStatusName(TaxDeclarationStatus status) => status switch
    {
        TaxDeclarationStatus.Draft => "Taslak",
        TaxDeclarationStatus.Ready => "Hazır",
        TaxDeclarationStatus.Approved => "Onaylandı",
        TaxDeclarationStatus.Filed => "Beyan Edildi",
        TaxDeclarationStatus.Paid => "Ödendi",
        TaxDeclarationStatus.PartiallyPaid => "Kısmi Ödendi",
        TaxDeclarationStatus.Overdue => "Gecikmiş",
        TaxDeclarationStatus.Cancelled => "İptal",
        _ => status.ToString()
    };
}

/// <summary>
/// Query to get tax declaration statistics
/// </summary>
public class GetTaxDeclarationStatsQuery : IRequest<Result<TaxDeclarationStatsDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? Year { get; set; }
}

/// <summary>
/// Handler for GetTaxDeclarationStatsQuery
/// </summary>
public class GetTaxDeclarationStatsQueryHandler : IRequestHandler<GetTaxDeclarationStatsQuery, Result<TaxDeclarationStatsDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetTaxDeclarationStatsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationStatsDto>> Handle(GetTaxDeclarationStatsQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.Now.Year;
        var stats = await _unitOfWork.TaxDeclarations.GetYearlyStatsAsync(year, cancellationToken);

        var overdueCount = (await _unitOfWork.TaxDeclarations.GetOverdueDeclarationsAsync(cancellationToken)).Count;
        var unpaidDeclarations = await _unitOfWork.TaxDeclarations.GetUnpaidDeclarationsAsync(cancellationToken);
        var totalUnpaid = unpaidDeclarations.Sum(d => d.RemainingBalance.Amount);

        // Get counts by type
        var declarations = await _unitOfWork.TaxDeclarations.GetByYearAsync(year, cancellationToken: cancellationToken);
        var kdvCount = declarations.Count(d => d.DeclarationType == TaxDeclarationType.Kdv);
        var muhtasarCount = declarations.Count(d => d.DeclarationType == TaxDeclarationType.Muhtasar || d.DeclarationType == TaxDeclarationType.MuhtasarPrimHizmet);
        var geciciVergiCount = declarations.Count(d => d.DeclarationType == TaxDeclarationType.GeciciVergi);

        var dto = new TaxDeclarationStatsDto
        {
            TotalDeclarations = stats.TotalDeclarations,
            DraftDeclarations = stats.DraftCount,
            FiledDeclarations = stats.FiledCount,
            PaidDeclarations = stats.PaidCount,
            TotalTaxLiability = stats.TotalTax,
            TotalPaidAmount = stats.TotalPaid,
            TotalUnpaidAmount = totalUnpaid,
            OverdueDeclarations = overdueCount,
            KdvDeclarations = kdvCount,
            MuhtasarDeclarations = muhtasarCount,
            GeciciVergiDeclarations = geciciVergiCount
        };

        return Result<TaxDeclarationStatsDto>.Success(dto);
    }
}

/// <summary>
/// Query to get overdue tax declarations
/// </summary>
public class GetOverdueTaxDeclarationsQuery : IRequest<Result<List<TaxDeclarationSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetOverdueTaxDeclarationsQuery
/// </summary>
public class GetOverdueTaxDeclarationsQueryHandler : IRequestHandler<GetOverdueTaxDeclarationsQuery, Result<List<TaxDeclarationSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverdueTaxDeclarationsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<TaxDeclarationSummaryDto>>> Handle(GetOverdueTaxDeclarationsQuery request, CancellationToken cancellationToken)
    {
        var declarations = await _unitOfWork.TaxDeclarations.GetOverdueDeclarationsAsync(cancellationToken);

        var dtos = declarations.Select(d => new TaxDeclarationSummaryDto
        {
            Id = d.Id,
            DeclarationNumber = d.DeclarationNumber,
            DeclarationType = d.DeclarationType,
            DeclarationTypeName = GetDeclarationTypeName(d.DeclarationType),
            TaxYear = d.TaxYear,
            TaxMonth = d.TaxMonth,
            TaxQuarter = d.TaxQuarter,
            FilingDeadline = d.FilingDeadline,
            PaymentDeadline = d.PaymentDeadline,
            NetTax = d.NetTax.Amount,
            PaidAmount = d.PaidAmount.Amount,
            RemainingBalance = d.RemainingBalance.Amount,
            Currency = d.NetTax.Currency,
            Status = d.Status,
            IsAmendment = d.IsAmendment,
            IsOverdue = true,
            IsPaymentOverdue = d.PaymentDeadline < DateTime.Today && d.RemainingBalance.Amount > 0
        }).ToList();

        return Result<List<TaxDeclarationSummaryDto>>.Success(dtos);
    }

    private static string GetDeclarationTypeName(TaxDeclarationType type) => type switch
    {
        TaxDeclarationType.Kdv => "KDV Beyannamesi",
        TaxDeclarationType.Muhtasar => "Muhtasar Beyanname",
        TaxDeclarationType.GeciciVergi => "Geçici Vergi",
        _ => type.ToString()
    };
}

/// <summary>
/// Query to get upcoming tax deadlines
/// </summary>
public class GetUpcomingTaxDeadlinesQuery : IRequest<Result<List<TaxCalendarItemDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int DaysAhead { get; set; } = 30;
}

/// <summary>
/// Handler for GetUpcomingTaxDeadlinesQuery
/// </summary>
public class GetUpcomingTaxDeadlinesQueryHandler : IRequestHandler<GetUpcomingTaxDeadlinesQuery, Result<List<TaxCalendarItemDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetUpcomingTaxDeadlinesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<TaxCalendarItemDto>>> Handle(GetUpcomingTaxDeadlinesQuery request, CancellationToken cancellationToken)
    {
        var declarations = await _unitOfWork.TaxDeclarations.GetUpcomingDeadlinesAsync(request.DaysAhead, cancellationToken);
        var today = DateTime.Today;

        var dtos = declarations.Select(d => new TaxCalendarItemDto
        {
            DeclarationType = d.DeclarationType,
            DeclarationTypeName = GetDeclarationTypeName(d.DeclarationType),
            TaxYear = d.TaxYear,
            TaxMonth = d.TaxMonth,
            TaxQuarter = d.TaxQuarter,
            PeriodDisplay = GetPeriodDisplay(d),
            FilingDeadline = d.FilingDeadline,
            PaymentDeadline = d.PaymentDeadline,
            DeclarationId = d.Id,
            Status = d.Status,
            StatusName = d.Status.ToString(),
            IsFiled = d.Status >= TaxDeclarationStatus.Filed,
            IsPaid = d.Status == TaxDeclarationStatus.Paid,
            IsOverdue = d.FilingDeadline < today,
            DaysUntilDeadline = (d.FilingDeadline - today).Days
        }).ToList();

        return Result<List<TaxCalendarItemDto>>.Success(dtos);
    }

    private static string GetDeclarationTypeName(TaxDeclarationType type) => type switch
    {
        TaxDeclarationType.Kdv => "KDV Beyannamesi",
        TaxDeclarationType.Muhtasar => "Muhtasar Beyanname",
        TaxDeclarationType.GeciciVergi => "Geçici Vergi",
        _ => type.ToString()
    };

    private static string GetPeriodDisplay(TaxDeclaration declaration)
    {
        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        if (declaration.TaxMonth.HasValue)
        {
            return $"{monthNames[declaration.TaxMonth.Value]} {declaration.TaxYear}";
        }

        if (declaration.TaxQuarter.HasValue)
        {
            return $"{declaration.TaxQuarter}. Çeyrek {declaration.TaxYear}";
        }

        return declaration.TaxYear.ToString();
    }
}
