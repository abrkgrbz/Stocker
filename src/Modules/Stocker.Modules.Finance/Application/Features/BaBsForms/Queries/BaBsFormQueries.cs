using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.BaBsForms.Queries;

/// <summary>
/// Query to get paginated Ba-Bs forms
/// </summary>
public class GetBaBsFormsQuery : IRequest<Result<PagedResult<BaBsFormSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public BaBsFormFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetBaBsFormsQuery
/// </summary>
public class GetBaBsFormsQueryHandler : IRequestHandler<GetBaBsFormsQuery, Result<PagedResult<BaBsFormSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBaBsFormsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<BaBsFormSummaryDto>>> Handle(GetBaBsFormsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.BaBsForms.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(f =>
                    f.FormNumber.ToLower().Contains(searchTerm) ||
                    f.CompanyName.ToLower().Contains(searchTerm) ||
                    f.TaxId.Contains(searchTerm));
            }

            if (request.Filter.FormType.HasValue)
            {
                query = query.Where(f => f.FormType == request.Filter.FormType.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(f => f.Status == request.Filter.Status.Value);
            }

            if (request.Filter.PeriodYear.HasValue)
            {
                query = query.Where(f => f.PeriodYear == request.Filter.PeriodYear.Value);
            }

            if (request.Filter.PeriodMonth.HasValue)
            {
                query = query.Where(f => f.PeriodMonth == request.Filter.PeriodMonth.Value);
            }

            if (request.Filter.IsCorrection.HasValue)
            {
                query = query.Where(f => f.IsCorrection == request.Filter.IsCorrection.Value);
            }

            if (request.Filter.IsOverdue.HasValue && request.Filter.IsOverdue.Value)
            {
                var today = DateTime.Today;
                query = query.Where(f =>
                    f.FilingDeadline < today &&
                    f.Status != BaBsFormStatus.Filed &&
                    f.Status != BaBsFormStatus.Accepted &&
                    f.Status != BaBsFormStatus.Cancelled);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "PeriodYear";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "formnumber" => sortDesc ? query.OrderByDescending(f => f.FormNumber) : query.OrderBy(f => f.FormNumber),
            "formtype" => sortDesc ? query.OrderByDescending(f => f.FormType) : query.OrderBy(f => f.FormType),
            "status" => sortDesc ? query.OrderByDescending(f => f.Status) : query.OrderBy(f => f.Status),
            "filingdeadline" => sortDesc ? query.OrderByDescending(f => f.FilingDeadline) : query.OrderBy(f => f.FilingDeadline),
            "totalamount" => sortDesc ? query.OrderByDescending(f => f.TotalAmountIncludingVat.Amount) : query.OrderBy(f => f.TotalAmountIncludingVat.Amount),
            _ => sortDesc
                ? query.OrderByDescending(f => f.PeriodYear).ThenByDescending(f => f.PeriodMonth)
                : query.OrderBy(f => f.PeriodYear).ThenBy(f => f.PeriodMonth)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var forms = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = forms.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<BaBsFormSummaryDto>>.Success(
            new PagedResult<BaBsFormSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static BaBsFormSummaryDto MapToSummaryDto(BaBsForm form)
    {
        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        return new BaBsFormSummaryDto
        {
            Id = form.Id,
            FormNumber = form.FormNumber,
            FormType = form.FormType,
            FormTypeName = form.FormType == BaBsFormType.Ba ? "Ba (Alış)" : "Bs (Satış)",
            PeriodYear = form.PeriodYear,
            PeriodMonth = form.PeriodMonth,
            PeriodDisplay = $"{monthNames[form.PeriodMonth]} {form.PeriodYear}",
            FilingDeadline = form.FilingDeadline,
            TotalRecordCount = form.TotalRecordCount,
            TotalAmountIncludingVat = form.TotalAmountIncludingVat.Amount,
            Currency = form.TotalAmountIncludingVat.Currency,
            Status = form.Status,
            StatusName = GetStatusName(form.Status),
            IsCorrection = form.IsCorrection,
            IsOverdue = form.FilingDeadline < DateTime.Today &&
                       form.Status != BaBsFormStatus.Filed &&
                       form.Status != BaBsFormStatus.Accepted &&
                       form.Status != BaBsFormStatus.Cancelled
        };
    }

    private static string GetStatusName(BaBsFormStatus status) => status switch
    {
        BaBsFormStatus.Draft => "Taslak",
        BaBsFormStatus.Ready => "Hazır",
        BaBsFormStatus.Approved => "Onaylandı",
        BaBsFormStatus.Filed => "Gönderildi",
        BaBsFormStatus.Accepted => "Kabul Edildi",
        BaBsFormStatus.Rejected => "Reddedildi",
        BaBsFormStatus.Cancelled => "İptal",
        _ => status.ToString()
    };
}

/// <summary>
/// Query to get a Ba-Bs form by ID with items
/// </summary>
public class GetBaBsFormByIdQuery : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetBaBsFormByIdQuery
/// </summary>
public class GetBaBsFormByIdQueryHandler : IRequestHandler<GetBaBsFormByIdQuery, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBaBsFormByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(GetBaBsFormByIdQuery request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        var dto = MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }

    internal static BaBsFormDto MapToDto(BaBsForm form)
    {
        return new BaBsFormDto
        {
            Id = form.Id,
            FormNumber = form.FormNumber,
            FormType = form.FormType,
            FormTypeName = form.FormType == BaBsFormType.Ba ? "Ba (Alış)" : "Bs (Satış)",
            PeriodYear = form.PeriodYear,
            PeriodMonth = form.PeriodMonth,
            PeriodStart = form.PeriodStart,
            PeriodEnd = form.PeriodEnd,
            FilingDeadline = form.FilingDeadline,
            TotalRecordCount = form.TotalRecordCount,
            TotalAmountExcludingVat = form.TotalAmountExcludingVat.Amount,
            TotalVat = form.TotalVat.Amount,
            TotalAmountIncludingVat = form.TotalAmountIncludingVat.Amount,
            Currency = form.TotalAmountIncludingVat.Currency,
            Status = form.Status,
            StatusName = GetStatusName(form.Status),
            IsCorrection = form.IsCorrection,
            CorrectedFormId = form.CorrectedFormId,
            CorrectionSequence = form.CorrectionSequence,
            CorrectionReason = form.CorrectionReason,
            TaxId = form.TaxId,
            TaxOffice = form.TaxOffice,
            CompanyName = form.CompanyName,
            PreparedBy = form.PreparedBy,
            PreparationDate = form.PreparationDate,
            ApprovedBy = form.ApprovedBy,
            ApprovalDate = form.ApprovalDate,
            FilingDate = form.FilingDate,
            GibApprovalNumber = form.GibApprovalNumber,
            GibSubmissionReference = form.GibSubmissionReference,
            AccountingPeriodId = form.AccountingPeriodId,
            Notes = form.Notes,
            Items = form.Items.Select(MapItemToDto).ToList(),
            CreatedAt = form.CreatedDate,
            UpdatedAt = form.UpdatedDate
        };
    }

    private static BaBsFormItemDto MapItemToDto(BaBsFormItem item)
    {
        return new BaBsFormItemDto
        {
            Id = item.Id,
            BaBsFormId = item.BaBsFormId,
            SequenceNumber = item.SequenceNumber,
            CounterpartyTaxId = item.CounterpartyTaxId,
            CounterpartyName = item.CounterpartyName,
            CountryCode = item.CountryCode,
            DocumentType = item.DocumentType,
            DocumentTypeName = GetDocumentTypeName(item.DocumentType),
            DocumentCount = item.DocumentCount,
            AmountExcludingVat = item.AmountExcludingVat.Amount,
            VatAmount = item.VatAmount.Amount,
            TotalAmountIncludingVat = item.TotalAmountIncludingVat.Amount,
            Currency = item.AmountExcludingVat.Currency,
            Notes = item.Notes
        };
    }

    private static string GetStatusName(BaBsFormStatus status) => status switch
    {
        BaBsFormStatus.Draft => "Taslak",
        BaBsFormStatus.Ready => "Hazır",
        BaBsFormStatus.Approved => "Onaylandı",
        BaBsFormStatus.Filed => "Gönderildi",
        BaBsFormStatus.Accepted => "Kabul Edildi",
        BaBsFormStatus.Rejected => "Reddedildi",
        BaBsFormStatus.Cancelled => "İptal",
        _ => status.ToString()
    };

    private static string GetDocumentTypeName(BaBsDocumentType docType) => docType switch
    {
        BaBsDocumentType.Invoice => "Fatura",
        BaBsDocumentType.ProfessionalServiceReceipt => "Serbest Meslek Makbuzu",
        BaBsDocumentType.ExpenseVoucher => "Gider Pusulası",
        BaBsDocumentType.ProducerReceipt => "Müstahsil Makbuzu",
        BaBsDocumentType.Other => "Diğer",
        _ => docType.ToString()
    };
}

/// <summary>
/// Query to get overdue Ba-Bs forms
/// </summary>
public class GetOverdueBaBsFormsQuery : IRequest<Result<List<BaBsFormSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetOverdueBaBsFormsQuery
/// </summary>
public class GetOverdueBaBsFormsQueryHandler : IRequestHandler<GetOverdueBaBsFormsQuery, Result<List<BaBsFormSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverdueBaBsFormsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BaBsFormSummaryDto>>> Handle(GetOverdueBaBsFormsQuery request, CancellationToken cancellationToken)
    {
        var forms = await _unitOfWork.BaBsForms.GetOverdueFormsAsync(cancellationToken);

        var monthNames = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        var dtos = forms.Select(f => new BaBsFormSummaryDto
        {
            Id = f.Id,
            FormNumber = f.FormNumber,
            FormType = f.FormType,
            FormTypeName = f.FormType == BaBsFormType.Ba ? "Ba (Alış)" : "Bs (Satış)",
            PeriodYear = f.PeriodYear,
            PeriodMonth = f.PeriodMonth,
            PeriodDisplay = $"{monthNames[f.PeriodMonth]} {f.PeriodYear}",
            FilingDeadline = f.FilingDeadline,
            TotalRecordCount = f.TotalRecordCount,
            TotalAmountIncludingVat = f.TotalAmountIncludingVat.Amount,
            Currency = f.TotalAmountIncludingVat.Currency,
            Status = f.Status,
            StatusName = f.Status.ToString(),
            IsCorrection = f.IsCorrection,
            IsOverdue = true
        }).ToList();

        return Result<List<BaBsFormSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get Ba-Bs form statistics
/// </summary>
public class GetBaBsFormStatsQuery : IRequest<Result<BaBsFormStatsDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? Year { get; set; }
}

/// <summary>
/// Handler for GetBaBsFormStatsQuery
/// </summary>
public class GetBaBsFormStatsQueryHandler : IRequestHandler<GetBaBsFormStatsQuery, Result<BaBsFormStatsDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBaBsFormStatsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormStatsDto>> Handle(GetBaBsFormStatsQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.Now.Year;
        var stats = await _unitOfWork.BaBsForms.GetYearlyStatsAsync(year, cancellationToken);

        var overdueCount = (await _unitOfWork.BaBsForms.GetOverdueFormsAsync(cancellationToken)).Count;

        var dto = new BaBsFormStatsDto
        {
            TotalForms = stats.TotalForms,
            DraftForms = stats.DraftForms,
            FiledForms = stats.FiledForms,
            AcceptedForms = stats.AcceptedForms,
            TotalBaAmount = stats.TotalBaAmount,
            TotalBsAmount = stats.TotalBsAmount,
            OverdueForms = overdueCount
        };

        return Result<BaBsFormStatsDto>.Success(dto);
    }
}

/// <summary>
/// Query to validate a Ba-Bs form
/// </summary>
public class ValidateBaBsFormQuery : IRequest<Result<BaBsValidationResultDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ValidateBaBsFormQuery
/// </summary>
public class ValidateBaBsFormQueryHandler : IRequestHandler<ValidateBaBsFormQuery, Result<BaBsValidationResultDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ValidateBaBsFormQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsValidationResultDto>> Handle(ValidateBaBsFormQuery request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsValidationResultDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        var validationResult = form.Validate();

        var dto = new BaBsValidationResultDto
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors,
            Warnings = validationResult.Warnings
        };

        return Result<BaBsValidationResultDto>.Success(dto);
    }
}
