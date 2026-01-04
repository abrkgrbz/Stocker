using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Loans.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Loans.Queries;

#region GetLoansQuery

/// <summary>
/// Query to get paginated loans
/// Sayfalandırılmış kredi listesi sorgusu
/// </summary>
public class GetLoansQuery : IRequest<Result<PagedResult<LoanSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public LoanFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetLoansQuery
/// </summary>
public class GetLoansQueryHandler : IRequestHandler<GetLoansQuery, Result<PagedResult<LoanSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoansQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<LoanSummaryDto>>> Handle(GetLoansQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Loans.AsQueryable()
            .Include(l => l.Schedule.Where(s => !s.IsPaid).OrderBy(s => s.DueDate).Take(1))
            .AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(l =>
                    l.LoanNumber.ToLower().Contains(searchTerm) ||
                    l.LenderName.ToLower().Contains(searchTerm) ||
                    (l.ExternalReference != null && l.ExternalReference.ToLower().Contains(searchTerm)) ||
                    (l.Purpose != null && l.Purpose.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.LoanType.HasValue)
            {
                query = query.Where(l => l.LoanType == request.Filter.LoanType.Value);
            }

            if (request.Filter.SubType.HasValue)
            {
                query = query.Where(l => l.SubType == request.Filter.SubType.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(l => l.Status == request.Filter.Status.Value);
            }

            if (request.Filter.InterestType.HasValue)
            {
                query = query.Where(l => l.InterestType == request.Filter.InterestType.Value);
            }

            if (request.Filter.LenderId.HasValue)
            {
                query = query.Where(l => l.LenderId == request.Filter.LenderId.Value);
            }

            if (request.Filter.StartDateFrom.HasValue)
            {
                query = query.Where(l => l.StartDate >= request.Filter.StartDateFrom.Value);
            }

            if (request.Filter.StartDateTo.HasValue)
            {
                query = query.Where(l => l.StartDate <= request.Filter.StartDateTo.Value);
            }

            if (request.Filter.EndDateFrom.HasValue)
            {
                query = query.Where(l => l.EndDate >= request.Filter.EndDateFrom.Value);
            }

            if (request.Filter.EndDateTo.HasValue)
            {
                query = query.Where(l => l.EndDate <= request.Filter.EndDateTo.Value);
            }

            if (request.Filter.MinPrincipalAmount.HasValue)
            {
                query = query.Where(l => l.PrincipalAmount.Amount >= request.Filter.MinPrincipalAmount.Value);
            }

            if (request.Filter.MaxPrincipalAmount.HasValue)
            {
                query = query.Where(l => l.PrincipalAmount.Amount <= request.Filter.MaxPrincipalAmount.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter.Currency))
            {
                query = query.Where(l => l.PrincipalAmount.Currency == request.Filter.Currency);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "StartDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "loannumber" => sortDesc ? query.OrderByDescending(l => l.LoanNumber) : query.OrderBy(l => l.LoanNumber),
            "principalamount" => sortDesc ? query.OrderByDescending(l => l.PrincipalAmount.Amount) : query.OrderBy(l => l.PrincipalAmount.Amount),
            "remainingprincipal" => sortDesc ? query.OrderByDescending(l => l.RemainingPrincipal.Amount) : query.OrderBy(l => l.RemainingPrincipal.Amount),
            "lendername" => sortDesc ? query.OrderByDescending(l => l.LenderName) : query.OrderBy(l => l.LenderName),
            "enddate" => sortDesc ? query.OrderByDescending(l => l.EndDate) : query.OrderBy(l => l.EndDate),
            "status" => sortDesc ? query.OrderByDescending(l => l.Status) : query.OrderBy(l => l.Status),
            "interestrate" => sortDesc ? query.OrderByDescending(l => l.AnnualInterestRate) : query.OrderBy(l => l.AnnualInterestRate),
            _ => sortDesc ? query.OrderByDescending(l => l.StartDate) : query.OrderBy(l => l.StartDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var loans = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = loans.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<LoanSummaryDto>>.Success(
            new PagedResult<LoanSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static LoanSummaryDto MapToSummaryDto(Loan loan)
    {
        var nextScheduleItem = loan.Schedule.FirstOrDefault(s => !s.IsPaid);

        return new LoanSummaryDto
        {
            Id = loan.Id,
            LoanNumber = loan.LoanNumber,
            ExternalReference = loan.ExternalReference,
            LoanType = loan.LoanType,
            LoanTypeName = GetLoanTypeName(loan.LoanType),
            LenderName = loan.LenderName,
            PrincipalAmount = loan.PrincipalAmount.Amount,
            RemainingPrincipal = loan.RemainingPrincipal.Amount,
            Currency = loan.PrincipalAmount.Currency,
            AnnualInterestRate = loan.AnnualInterestRate,
            StartDate = loan.StartDate,
            EndDate = loan.EndDate,
            TotalInstallments = loan.TotalInstallments,
            PaidInstallments = loan.PaidInstallments,
            Status = loan.Status,
            StatusName = GetStatusName(loan.Status),
            ProgressPercentage = loan.PrincipalAmount.Amount > 0
                ? Math.Round((loan.PrincipalAmount.Amount - loan.RemainingPrincipal.Amount) / loan.PrincipalAmount.Amount * 100, 2)
                : 0,
            NextPaymentDate = nextScheduleItem?.DueDate,
            NextPaymentAmount = nextScheduleItem?.TotalAmount.Amount
        };
    }

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetStatusName(LoanStatus status) => status switch
    {
        LoanStatus.Draft => "Taslak",
        LoanStatus.PendingApproval => "Onay Bekliyor",
        LoanStatus.Approved => "Onaylandı",
        LoanStatus.Active => "Aktif",
        LoanStatus.Closed => "Kapalı",
        LoanStatus.Defaulted => "Temerrüt",
        LoanStatus.Restructured => "Yeniden Yapılandırıldı",
        LoanStatus.Cancelled => "İptal Edildi",
        _ => status.ToString()
    };
}

#endregion

#region GetLoanByIdQuery

/// <summary>
/// Query to get a loan by ID
/// ID'ye göre kredi sorgulama
/// </summary>
public class GetLoanByIdQuery : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetLoanByIdQuery
/// </summary>
public class GetLoanByIdQueryHandler : IRequestHandler<GetLoanByIdQuery, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoanByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(GetLoanByIdQuery request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        var dto = CreateLoanCommandHandler.MapToDto(loan);
        return Result<LoanDto>.Success(dto);
    }
}

#endregion

#region GetActiveLoanQuery

/// <summary>
/// Query to get active loans
/// Aktif kredi listesi sorgusu
/// </summary>
public class GetActiveLoansQuery : IRequest<Result<List<LoanSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public LoanType? LoanType { get; set; }
    public int? LenderId { get; set; }
}

/// <summary>
/// Handler for GetActiveLoansQuery
/// </summary>
public class GetActiveLoansQueryHandler : IRequestHandler<GetActiveLoansQuery, Result<List<LoanSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveLoansQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LoanSummaryDto>>> Handle(GetActiveLoansQuery request, CancellationToken cancellationToken)
    {
        var loans = await _unitOfWork.Loans.GetActiveLoansAsync(cancellationToken);

        // Apply additional filters
        if (request.LoanType.HasValue)
        {
            loans = loans.Where(l => l.LoanType == request.LoanType.Value).ToList();
        }

        if (request.LenderId.HasValue)
        {
            loans = loans.Where(l => l.LenderId == request.LenderId.Value).ToList();
        }

        var dtos = loans.Select(l => new LoanSummaryDto
        {
            Id = l.Id,
            LoanNumber = l.LoanNumber,
            ExternalReference = l.ExternalReference,
            LoanType = l.LoanType,
            LoanTypeName = GetLoanTypeName(l.LoanType),
            LenderName = l.LenderName,
            PrincipalAmount = l.PrincipalAmount.Amount,
            RemainingPrincipal = l.RemainingPrincipal.Amount,
            Currency = l.PrincipalAmount.Currency,
            AnnualInterestRate = l.AnnualInterestRate,
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            TotalInstallments = l.TotalInstallments,
            PaidInstallments = l.PaidInstallments,
            Status = l.Status,
            StatusName = GetStatusName(l.Status),
            ProgressPercentage = l.PrincipalAmount.Amount > 0
                ? Math.Round((l.PrincipalAmount.Amount - l.RemainingPrincipal.Amount) / l.PrincipalAmount.Amount * 100, 2)
                : 0
        }).ToList();

        return Result<List<LoanSummaryDto>>.Success(dtos);
    }

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetStatusName(LoanStatus status) => status switch
    {
        LoanStatus.Draft => "Taslak",
        LoanStatus.PendingApproval => "Onay Bekliyor",
        LoanStatus.Approved => "Onaylandı",
        LoanStatus.Active => "Aktif",
        LoanStatus.Closed => "Kapalı",
        LoanStatus.Defaulted => "Temerrüt",
        LoanStatus.Restructured => "Yeniden Yapılandırıldı",
        LoanStatus.Cancelled => "İptal Edildi",
        _ => status.ToString()
    };
}

#endregion

#region GetLoanPaymentScheduleQuery

/// <summary>
/// Query to get loan payment schedule
/// Kredi ödeme planı sorgusu
/// </summary>
public class GetLoanPaymentScheduleQuery : IRequest<Result<List<LoanScheduleDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int LoanId { get; set; }
    public bool? OnlyUnpaid { get; set; }
}

/// <summary>
/// Handler for GetLoanPaymentScheduleQuery
/// </summary>
public class GetLoanPaymentScheduleQueryHandler : IRequestHandler<GetLoanPaymentScheduleQuery, Result<List<LoanScheduleDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoanPaymentScheduleQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LoanScheduleDto>>> Handle(GetLoanPaymentScheduleQuery request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan == null)
        {
            return Result<List<LoanScheduleDto>>.Failure(
                Error.NotFound("Loan", $"ID {request.LoanId} ile kredi bulunamadı"));
        }

        var scheduleItems = await _unitOfWork.Loans.GetScheduleItemsAsync(request.LoanId, cancellationToken);

        if (request.OnlyUnpaid == true)
        {
            scheduleItems = scheduleItems.Where(s => !s.IsPaid).ToList();
        }

        var dtos = scheduleItems.Select(CreateLoanCommandHandler.MapScheduleToDto).ToList();
        return Result<List<LoanScheduleDto>>.Success(dtos);
    }
}

#endregion

#region GetLoanPaymentsQuery

/// <summary>
/// Query to get loan payments
/// Kredi ödemeleri sorgusu
/// </summary>
public class GetLoanPaymentsQuery : IRequest<Result<List<LoanPaymentDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int LoanId { get; set; }
}

/// <summary>
/// Handler for GetLoanPaymentsQuery
/// </summary>
public class GetLoanPaymentsQueryHandler : IRequestHandler<GetLoanPaymentsQuery, Result<List<LoanPaymentDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoanPaymentsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LoanPaymentDto>>> Handle(GetLoanPaymentsQuery request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithPaymentsAsync(request.LoanId, cancellationToken);
        if (loan == null)
        {
            return Result<List<LoanPaymentDto>>.Failure(
                Error.NotFound("Loan", $"ID {request.LoanId} ile kredi bulunamadı"));
        }

        var dtos = loan.Payments
            .OrderByDescending(p => p.PaymentDate)
            .Select(CreateLoanCommandHandler.MapPaymentToDto)
            .ToList();

        return Result<List<LoanPaymentDto>>.Success(dtos);
    }
}

#endregion

#region GetUpcomingLoanPaymentsQuery

/// <summary>
/// Query to get upcoming loan payments across all loans
/// Yaklaşan kredi ödemeleri sorgusu
/// </summary>
public class GetUpcomingLoanPaymentsQuery : IRequest<Result<List<UpcomingLoanPaymentDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Days { get; set; } = 30;
}

/// <summary>
/// DTO for upcoming loan payment
/// </summary>
public class UpcomingLoanPaymentDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string LenderName { get; set; } = string.Empty;
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public int DaysUntilDue { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// Handler for GetUpcomingLoanPaymentsQuery
/// </summary>
public class GetUpcomingLoanPaymentsQueryHandler : IRequestHandler<GetUpcomingLoanPaymentsQuery, Result<List<UpcomingLoanPaymentDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetUpcomingLoanPaymentsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<UpcomingLoanPaymentDto>>> Handle(GetUpcomingLoanPaymentsQuery request, CancellationToken cancellationToken)
    {
        var scheduleItems = await _unitOfWork.Loans.GetUpcomingScheduleItemsAsync(request.Days, cancellationToken);

        var dtos = scheduleItems.Select(s => new UpcomingLoanPaymentDto
        {
            LoanId = s.LoanId,
            LoanNumber = s.Loan.LoanNumber,
            LenderName = s.Loan.LenderName,
            InstallmentNumber = s.InstallmentNumber,
            DueDate = s.DueDate,
            PrincipalAmount = s.PrincipalAmount.Amount,
            InterestAmount = s.InterestAmount.Amount,
            TotalAmount = s.TotalAmount.Amount,
            Currency = s.PrincipalAmount.Currency,
            DaysUntilDue = (int)(s.DueDate - DateTime.UtcNow).TotalDays,
            IsOverdue = s.DueDate < DateTime.UtcNow
        }).OrderBy(s => s.DueDate).ToList();

        return Result<List<UpcomingLoanPaymentDto>>.Success(dtos);
    }
}

#endregion

#region GetOverdueLoansQuery

/// <summary>
/// Query to get overdue loans
/// Vadesi geçmiş kredi sorgusu
/// </summary>
public class GetOverdueLoansQuery : IRequest<Result<List<OverdueLoanDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// DTO for overdue loan
/// </summary>
public class OverdueLoanDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string LenderName { get; set; } = string.Empty;
    public LoanType LoanType { get; set; }
    public string LoanTypeName { get; set; } = string.Empty;
    public int OverdueInstallments { get; set; }
    public decimal TotalOverdueAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime OldestDueDate { get; set; }
    public int DaysOverdue { get; set; }
}

/// <summary>
/// Handler for GetOverdueLoansQuery
/// </summary>
public class GetOverdueLoansQueryHandler : IRequestHandler<GetOverdueLoansQuery, Result<List<OverdueLoanDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverdueLoansQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<OverdueLoanDto>>> Handle(GetOverdueLoansQuery request, CancellationToken cancellationToken)
    {
        var overdueScheduleItems = await _unitOfWork.Loans.GetOverdueScheduleItemsAsync(cancellationToken);

        var overdueLoans = overdueScheduleItems
            .GroupBy(s => s.LoanId)
            .Select(g =>
            {
                var firstItem = g.First();
                var oldestDueDate = g.Min(s => s.DueDate);
                return new OverdueLoanDto
                {
                    LoanId = firstItem.LoanId,
                    LoanNumber = firstItem.Loan.LoanNumber,
                    LenderName = firstItem.Loan.LenderName,
                    LoanType = firstItem.Loan.LoanType,
                    LoanTypeName = GetLoanTypeName(firstItem.Loan.LoanType),
                    OverdueInstallments = g.Count(),
                    TotalOverdueAmount = g.Sum(s => s.TotalAmount.Amount),
                    Currency = firstItem.TotalAmount.Currency,
                    OldestDueDate = oldestDueDate,
                    DaysOverdue = (int)(DateTime.UtcNow - oldestDueDate).TotalDays
                };
            })
            .OrderByDescending(o => o.DaysOverdue)
            .ToList();

        return Result<List<OverdueLoanDto>>.Success(overdueLoans);
    }

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };
}

#endregion

#region GetLoanSummaryStatisticsQuery

/// <summary>
/// Query to get loan summary statistics
/// Kredi özet istatistikleri sorgusu
/// </summary>
public class GetLoanSummaryStatisticsQuery : IRequest<Result<LoanSummaryStatisticsDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// DTO for loan summary statistics
/// </summary>
public class LoanSummaryStatisticsDto
{
    public int TotalLoans { get; set; }
    public int ActiveLoans { get; set; }
    public int ClosedLoans { get; set; }
    public int DefaultedLoans { get; set; }
    public decimal TotalPrincipal { get; set; }
    public decimal TotalRemainingPrincipal { get; set; }
    public decimal TotalPaidPrincipal { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal TotalPaidInterest { get; set; }
    public string Currency { get; set; } = "TRY";
    public int OverdueInstallments { get; set; }
    public decimal OverdueAmount { get; set; }
    public List<LoanTypeStatisticsDto> ByType { get; set; } = new();
}

/// <summary>
/// DTO for loan type statistics
/// </summary>
public class LoanTypeStatisticsDto
{
    public LoanType LoanType { get; set; }
    public string LoanTypeName { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalPrincipal { get; set; }
    public decimal RemainingPrincipal { get; set; }
}

/// <summary>
/// Handler for GetLoanSummaryStatisticsQuery
/// </summary>
public class GetLoanSummaryStatisticsQueryHandler : IRequestHandler<GetLoanSummaryStatisticsQuery, Result<LoanSummaryStatisticsDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoanSummaryStatisticsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanSummaryStatisticsDto>> Handle(GetLoanSummaryStatisticsQuery request, CancellationToken cancellationToken)
    {
        var currency = request.Currency ?? "TRY";

        var allLoans = await _unitOfWork.Loans.AsQueryable()
            .Where(l => l.PrincipalAmount.Currency == currency)
            .ToListAsync(cancellationToken);

        var overdueItems = await _unitOfWork.Loans.GetOverdueScheduleItemsAsync(cancellationToken);
        var overdueItemsFiltered = overdueItems.Where(s => s.TotalAmount.Currency == currency).ToList();

        var statistics = new LoanSummaryStatisticsDto
        {
            TotalLoans = allLoans.Count,
            ActiveLoans = allLoans.Count(l => l.Status == LoanStatus.Active),
            ClosedLoans = allLoans.Count(l => l.Status == LoanStatus.Closed),
            DefaultedLoans = allLoans.Count(l => l.Status == LoanStatus.Defaulted),
            TotalPrincipal = allLoans.Sum(l => l.PrincipalAmount.Amount),
            TotalRemainingPrincipal = allLoans.Where(l => l.Status == LoanStatus.Active).Sum(l => l.RemainingPrincipal.Amount),
            TotalPaidPrincipal = allLoans.Sum(l => l.PrincipalAmount.Amount - l.RemainingPrincipal.Amount),
            TotalInterest = allLoans.Sum(l => l.TotalInterest.Amount),
            TotalPaidInterest = allLoans.Sum(l => l.PaidInterest.Amount),
            Currency = currency,
            OverdueInstallments = overdueItemsFiltered.Count,
            OverdueAmount = overdueItemsFiltered.Sum(s => s.TotalAmount.Amount),
            ByType = allLoans
                .GroupBy(l => l.LoanType)
                .Select(g => new LoanTypeStatisticsDto
                {
                    LoanType = g.Key,
                    LoanTypeName = GetLoanTypeName(g.Key),
                    Count = g.Count(),
                    TotalPrincipal = g.Sum(l => l.PrincipalAmount.Amount),
                    RemainingPrincipal = g.Where(l => l.Status == LoanStatus.Active).Sum(l => l.RemainingPrincipal.Amount)
                })
                .OrderByDescending(t => t.TotalPrincipal)
                .ToList()
        };

        return Result<LoanSummaryStatisticsDto>.Success(statistics);
    }

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };
}

#endregion

#region GetLoansByLenderQuery

/// <summary>
/// Query to get loans by lender
/// Kredi verene göre kredi listesi sorgusu
/// </summary>
public class GetLoansByLenderQuery : IRequest<Result<List<LoanSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int LenderId { get; set; }
    public LoanStatus? Status { get; set; }
}

/// <summary>
/// Handler for GetLoansByLenderQuery
/// </summary>
public class GetLoansByLenderQueryHandler : IRequestHandler<GetLoansByLenderQuery, Result<List<LoanSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetLoansByLenderQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LoanSummaryDto>>> Handle(GetLoansByLenderQuery request, CancellationToken cancellationToken)
    {
        var loans = await _unitOfWork.Loans.GetByLenderAsync(request.LenderId, cancellationToken);

        if (request.Status.HasValue)
        {
            loans = loans.Where(l => l.Status == request.Status.Value).ToList();
        }

        var dtos = loans.Select(l => new LoanSummaryDto
        {
            Id = l.Id,
            LoanNumber = l.LoanNumber,
            ExternalReference = l.ExternalReference,
            LoanType = l.LoanType,
            LoanTypeName = GetLoanTypeName(l.LoanType),
            LenderName = l.LenderName,
            PrincipalAmount = l.PrincipalAmount.Amount,
            RemainingPrincipal = l.RemainingPrincipal.Amount,
            Currency = l.PrincipalAmount.Currency,
            AnnualInterestRate = l.AnnualInterestRate,
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            TotalInstallments = l.TotalInstallments,
            PaidInstallments = l.PaidInstallments,
            Status = l.Status,
            StatusName = GetStatusName(l.Status),
            ProgressPercentage = l.PrincipalAmount.Amount > 0
                ? Math.Round((l.PrincipalAmount.Amount - l.RemainingPrincipal.Amount) / l.PrincipalAmount.Amount * 100, 2)
                : 0
        }).ToList();

        return Result<List<LoanSummaryDto>>.Success(dtos);
    }

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetStatusName(LoanStatus status) => status switch
    {
        LoanStatus.Draft => "Taslak",
        LoanStatus.PendingApproval => "Onay Bekliyor",
        LoanStatus.Approved => "Onaylandı",
        LoanStatus.Active => "Aktif",
        LoanStatus.Closed => "Kapalı",
        LoanStatus.Defaulted => "Temerrüt",
        LoanStatus.Restructured => "Yeniden Yapılandırıldı",
        LoanStatus.Cancelled => "İptal Edildi",
        _ => status.ToString()
    };
}

#endregion
