using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.ExchangeRates.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.ExchangeRates.Queries;

#region Get Exchange Rates (Paginated)

/// <summary>
/// Sayfalanmış döviz kurları sorgulama (Get Paginated Exchange Rates Query)
/// </summary>
public class GetExchangeRatesQuery : IRequest<Result<PagedResult<ExchangeRateSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public ExchangeRateFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetExchangeRatesQuery
/// </summary>
public class GetExchangeRatesQueryHandler : IRequestHandler<GetExchangeRatesQuery, Result<PagedResult<ExchangeRateSummaryDto>>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetExchangeRatesQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<PagedResult<ExchangeRateSummaryDto>>> Handle(GetExchangeRatesQuery request, CancellationToken cancellationToken)
    {
        var query = _exchangeRateRepository.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(r =>
                    r.SourceCurrency.ToLower().Contains(searchTerm) ||
                    r.TargetCurrency.ToLower().Contains(searchTerm) ||
                    (r.CurrencyName != null && r.CurrencyName.ToLower().Contains(searchTerm)) ||
                    (r.CurrencyNameTurkish != null && r.CurrencyNameTurkish.ToLower().Contains(searchTerm)));
            }

            if (!string.IsNullOrEmpty(request.Filter.SourceCurrency))
            {
                query = query.Where(r => r.SourceCurrency == request.Filter.SourceCurrency.ToUpperInvariant());
            }

            if (!string.IsNullOrEmpty(request.Filter.TargetCurrency))
            {
                query = query.Where(r => r.TargetCurrency == request.Filter.TargetCurrency.ToUpperInvariant());
            }

            if (request.Filter.RateType.HasValue)
            {
                query = query.Where(r => r.RateType == request.Filter.RateType.Value);
            }

            if (request.Filter.Source.HasValue)
            {
                query = query.Where(r => r.Source == request.Filter.Source.Value);
            }

            if (request.Filter.StartDate.HasValue)
            {
                query = query.Where(r => r.RateDate >= request.Filter.StartDate.Value.Date);
            }

            if (request.Filter.EndDate.HasValue)
            {
                query = query.Where(r => r.RateDate <= request.Filter.EndDate.Value.Date);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(r => r.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsTcmbRate.HasValue)
            {
                query = query.Where(r => r.IsTcmbRate == request.Filter.IsTcmbRate.Value);
            }

            if (request.Filter.IsManualEntry.HasValue)
            {
                query = query.Where(r => r.IsManualEntry == request.Filter.IsManualEntry.Value);
            }

            if (request.Filter.IsDefaultForDate.HasValue)
            {
                query = query.Where(r => r.IsDefaultForDate == request.Filter.IsDefaultForDate.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "RateDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "sourcecurrency" => sortDesc ? query.OrderByDescending(r => r.SourceCurrency) : query.OrderBy(r => r.SourceCurrency),
            "targetcurrency" => sortDesc ? query.OrderByDescending(r => r.TargetCurrency) : query.OrderBy(r => r.TargetCurrency),
            "averagerate" => sortDesc ? query.OrderByDescending(r => r.AverageRate) : query.OrderBy(r => r.AverageRate),
            "ratetype" => sortDesc ? query.OrderByDescending(r => r.RateType) : query.OrderBy(r => r.RateType),
            "source" => sortDesc ? query.OrderByDescending(r => r.Source) : query.OrderBy(r => r.Source),
            "changepercentage" => sortDesc ? query.OrderByDescending(r => r.ChangePercentage) : query.OrderBy(r => r.ChangePercentage),
            _ => sortDesc ? query.OrderByDescending(r => r.RateDate) : query.OrderBy(r => r.RateDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var rates = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = rates.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<ExchangeRateSummaryDto>>.Success(
            new PagedResult<ExchangeRateSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static ExchangeRateSummaryDto MapToSummaryDto(ExchangeRate rate)
    {
        return new ExchangeRateSummaryDto
        {
            Id = rate.Id,
            SourceCurrency = rate.SourceCurrency,
            TargetCurrency = rate.TargetCurrency,
            RateDate = rate.RateDate,
            RateType = rate.RateType,
            RateTypeName = GetRateTypeName(rate.RateType),
            ForexBuying = rate.ForexBuying,
            ForexSelling = rate.ForexSelling,
            AverageRate = rate.AverageRate,
            Unit = rate.Unit,
            Source = rate.Source,
            SourceName = GetSourceName(rate.Source),
            Trend = rate.Trend,
            ChangePercentage = rate.ChangePercentage,
            IsActive = rate.IsActive,
            IsDefaultForDate = rate.IsDefaultForDate
        };
    }

    private static string GetRateTypeName(ExchangeRateType rateType) => rateType switch
    {
        ExchangeRateType.Daily => "Günlük",
        ExchangeRateType.WeeklyAverage => "Haftalık Ortalama",
        ExchangeRateType.MonthlyAverage => "Aylık Ortalama",
        ExchangeRateType.YearlyAverage => "Yıllık Ortalama",
        ExchangeRateType.MonthEnd => "Ay Sonu",
        ExchangeRateType.YearEnd => "Yıl Sonu",
        ExchangeRateType.Spot => "Spot",
        ExchangeRateType.Manual => "Manuel",
        _ => rateType.ToString()
    };

    private static string GetSourceName(ExchangeRateSource source) => source switch
    {
        ExchangeRateSource.TCMB => "TCMB",
        ExchangeRateSource.ECB => "ECB",
        ExchangeRateSource.Reuters => "Reuters",
        ExchangeRateSource.Bloomberg => "Bloomberg",
        ExchangeRateSource.Bank => "Banka",
        ExchangeRateSource.XE => "XE",
        ExchangeRateSource.Manual => "Manuel",
        _ => source.ToString()
    };
}

#endregion

#region Get Exchange Rate By Id

/// <summary>
/// ID ile döviz kuru sorgulama (Get Exchange Rate By Id Query)
/// </summary>
public class GetExchangeRateByIdQuery : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetExchangeRateByIdQuery
/// </summary>
public class GetExchangeRateByIdQueryHandler : IRequestHandler<GetExchangeRateByIdQuery, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetExchangeRateByIdQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(GetExchangeRateByIdQuery request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Get Exchange Rate By Date

/// <summary>
/// Tarih ve para birimi ile döviz kuru sorgulama (Get Exchange Rate By Date Query)
/// </summary>
public class GetExchangeRateByDateQuery : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = "TRY";
    public DateTime Date { get; set; }
    public bool UseDefaultOnly { get; set; } = true;
}

/// <summary>
/// GetExchangeRateByDateQuery Validator
/// </summary>
public class GetExchangeRateByDateQueryValidator : AbstractValidator<GetExchangeRateByDateQuery>
{
    public GetExchangeRateByDateQueryValidator()
    {
        RuleFor(x => x.SourceCurrency)
            .NotEmpty().WithMessage("Kaynak para birimi zorunludur")
            .Length(3).WithMessage("Kaynak para birimi 3 karakter olmalıdır");
        RuleFor(x => x.TargetCurrency)
            .NotEmpty().WithMessage("Hedef para birimi zorunludur")
            .Length(3).WithMessage("Hedef para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Tarih zorunludur");
    }
}

/// <summary>
/// Handler for GetExchangeRateByDateQuery
/// </summary>
public class GetExchangeRateByDateQueryHandler : IRequestHandler<GetExchangeRateByDateQuery, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetExchangeRateByDateQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(GetExchangeRateByDateQuery request, CancellationToken cancellationToken)
    {
        var sourceCurrency = request.SourceCurrency.ToUpperInvariant();
        var targetCurrency = request.TargetCurrency.ToUpperInvariant();
        var date = request.Date.Date;

        ExchangeRate? exchangeRate;

        if (request.UseDefaultOnly)
        {
            // First try to get the default rate for the date
            exchangeRate = await _exchangeRateRepository.FirstOrDefaultAsync(
                r => r.SourceCurrency == sourceCurrency &&
                     r.TargetCurrency == targetCurrency &&
                     r.RateDate.Date == date &&
                     r.IsDefaultForDate &&
                     r.IsActive,
                cancellationToken);
        }
        else
        {
            // Get any active rate for the date
            exchangeRate = await _exchangeRateRepository.FirstOrDefaultAsync(
                r => r.SourceCurrency == sourceCurrency &&
                     r.TargetCurrency == targetCurrency &&
                     r.RateDate.Date == date &&
                     r.IsActive,
                cancellationToken);
        }

        // If no rate found for exact date, try to find the most recent rate before the date
        if (exchangeRate == null)
        {
            var query = _exchangeRateRepository.AsQueryable()
                .Where(r => r.SourceCurrency == sourceCurrency &&
                           r.TargetCurrency == targetCurrency &&
                           r.RateDate.Date <= date &&
                           r.IsActive)
                .OrderByDescending(r => r.RateDate);

            exchangeRate = await query.FirstOrDefaultAsync(cancellationToken);
        }

        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"{sourceCurrency}/{targetCurrency} için {date:dd.MM.yyyy} tarihinde kur bulunamadı"));
        }

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Get Latest Exchange Rate

/// <summary>
/// Para birimi için en güncel kur sorgulama (Get Latest Exchange Rate Query)
/// </summary>
public class GetLatestExchangeRateQuery : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = "TRY";
}

/// <summary>
/// GetLatestExchangeRateQuery Validator
/// </summary>
public class GetLatestExchangeRateQueryValidator : AbstractValidator<GetLatestExchangeRateQuery>
{
    public GetLatestExchangeRateQueryValidator()
    {
        RuleFor(x => x.SourceCurrency)
            .NotEmpty().WithMessage("Kaynak para birimi zorunludur")
            .Length(3).WithMessage("Kaynak para birimi 3 karakter olmalıdır");
        RuleFor(x => x.TargetCurrency)
            .NotEmpty().WithMessage("Hedef para birimi zorunludur")
            .Length(3).WithMessage("Hedef para birimi 3 karakter olmalıdır");
    }
}

/// <summary>
/// Handler for GetLatestExchangeRateQuery
/// </summary>
public class GetLatestExchangeRateQueryHandler : IRequestHandler<GetLatestExchangeRateQuery, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetLatestExchangeRateQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(GetLatestExchangeRateQuery request, CancellationToken cancellationToken)
    {
        var sourceCurrency = request.SourceCurrency.ToUpperInvariant();
        var targetCurrency = request.TargetCurrency.ToUpperInvariant();

        var exchangeRate = await _exchangeRateRepository.AsQueryable()
            .Where(r => r.SourceCurrency == sourceCurrency &&
                       r.TargetCurrency == targetCurrency &&
                       r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"{sourceCurrency}/{targetCurrency} için aktif kur bulunamadı"));
        }

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Get Exchange Rates By Currency

/// <summary>
/// Para birimine göre kurları sorgulama (Get Exchange Rates By Currency Query)
/// </summary>
public class GetExchangeRatesByCurrencyQuery : IRequest<Result<List<ExchangeRateSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string SourceCurrency { get; set; } = string.Empty;
    public string TargetCurrency { get; set; } = "TRY";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MaxResults { get; set; } = 30;
}

/// <summary>
/// Handler for GetExchangeRatesByCurrencyQuery
/// </summary>
public class GetExchangeRatesByCurrencyQueryHandler : IRequestHandler<GetExchangeRatesByCurrencyQuery, Result<List<ExchangeRateSummaryDto>>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetExchangeRatesByCurrencyQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<List<ExchangeRateSummaryDto>>> Handle(GetExchangeRatesByCurrencyQuery request, CancellationToken cancellationToken)
    {
        var sourceCurrency = request.SourceCurrency.ToUpperInvariant();
        var targetCurrency = request.TargetCurrency.ToUpperInvariant();

        var query = _exchangeRateRepository.AsQueryable()
            .Where(r => r.SourceCurrency == sourceCurrency &&
                       r.TargetCurrency == targetCurrency &&
                       r.IsActive);

        if (request.StartDate.HasValue)
        {
            query = query.Where(r => r.RateDate >= request.StartDate.Value.Date);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(r => r.RateDate <= request.EndDate.Value.Date);
        }

        query = query.OrderByDescending(r => r.RateDate);

        if (request.MaxResults.HasValue)
        {
            query = query.Take(request.MaxResults.Value);
        }

        var rates = await query.ToListAsync(cancellationToken);

        var dtos = rates.Select(r => new ExchangeRateSummaryDto
        {
            Id = r.Id,
            SourceCurrency = r.SourceCurrency,
            TargetCurrency = r.TargetCurrency,
            RateDate = r.RateDate,
            RateType = r.RateType,
            RateTypeName = GetRateTypeName(r.RateType),
            ForexBuying = r.ForexBuying,
            ForexSelling = r.ForexSelling,
            AverageRate = r.AverageRate,
            Unit = r.Unit,
            Source = r.Source,
            SourceName = GetSourceName(r.Source),
            Trend = r.Trend,
            ChangePercentage = r.ChangePercentage,
            IsActive = r.IsActive,
            IsDefaultForDate = r.IsDefaultForDate
        }).ToList();

        return Result<List<ExchangeRateSummaryDto>>.Success(dtos);
    }

    private static string GetRateTypeName(ExchangeRateType rateType) => rateType switch
    {
        ExchangeRateType.Daily => "Günlük",
        ExchangeRateType.WeeklyAverage => "Haftalık Ortalama",
        ExchangeRateType.MonthlyAverage => "Aylık Ortalama",
        ExchangeRateType.YearlyAverage => "Yıllık Ortalama",
        ExchangeRateType.MonthEnd => "Ay Sonu",
        ExchangeRateType.YearEnd => "Yıl Sonu",
        ExchangeRateType.Spot => "Spot",
        ExchangeRateType.Manual => "Manuel",
        _ => rateType.ToString()
    };

    private static string GetSourceName(ExchangeRateSource source) => source switch
    {
        ExchangeRateSource.TCMB => "TCMB",
        ExchangeRateSource.ECB => "ECB",
        ExchangeRateSource.Reuters => "Reuters",
        ExchangeRateSource.Bloomberg => "Bloomberg",
        ExchangeRateSource.Bank => "Banka",
        ExchangeRateSource.XE => "XE",
        ExchangeRateSource.Manual => "Manuel",
        _ => source.ToString()
    };
}

#endregion

#region Get TCMB Rates

/// <summary>
/// TCMB kurlarını sorgulama (Get TCMB Rates Query)
/// </summary>
public class GetTcmbRatesQuery : IRequest<Result<List<ExchangeRateSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime? Date { get; set; }
    public bool LatestOnly { get; set; } = true;
}

/// <summary>
/// Handler for GetTcmbRatesQuery
/// </summary>
public class GetTcmbRatesQueryHandler : IRequestHandler<GetTcmbRatesQuery, Result<List<ExchangeRateSummaryDto>>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public GetTcmbRatesQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<List<ExchangeRateSummaryDto>>> Handle(GetTcmbRatesQuery request, CancellationToken cancellationToken)
    {
        IQueryable<ExchangeRate> query = _exchangeRateRepository.AsQueryable()
            .Where(r => r.IsTcmbRate && r.IsActive);

        if (request.Date.HasValue)
        {
            query = query.Where(r => r.RateDate.Date == request.Date.Value.Date);
        }
        else if (request.LatestOnly)
        {
            // Get the most recent date that has TCMB rates
            var latestDate = await _exchangeRateRepository.AsQueryable()
                .Where(r => r.IsTcmbRate && r.IsActive)
                .OrderByDescending(r => r.RateDate)
                .Select(r => r.RateDate.Date)
                .FirstOrDefaultAsync(cancellationToken);

            if (latestDate != default)
            {
                query = query.Where(r => r.RateDate.Date == latestDate);
            }
        }

        var rates = await query
            .OrderBy(r => r.SourceCurrency)
            .ToListAsync(cancellationToken);

        var dtos = rates.Select(r => new ExchangeRateSummaryDto
        {
            Id = r.Id,
            SourceCurrency = r.SourceCurrency,
            TargetCurrency = r.TargetCurrency,
            RateDate = r.RateDate,
            RateType = r.RateType,
            RateTypeName = GetRateTypeName(r.RateType),
            ForexBuying = r.ForexBuying,
            ForexSelling = r.ForexSelling,
            AverageRate = r.AverageRate,
            Unit = r.Unit,
            Source = r.Source,
            SourceName = "TCMB",
            Trend = r.Trend,
            ChangePercentage = r.ChangePercentage,
            IsActive = r.IsActive,
            IsDefaultForDate = r.IsDefaultForDate
        }).ToList();

        return Result<List<ExchangeRateSummaryDto>>.Success(dtos);
    }

    private static string GetRateTypeName(ExchangeRateType rateType) => rateType switch
    {
        ExchangeRateType.Daily => "Günlük",
        ExchangeRateType.WeeklyAverage => "Haftalık Ortalama",
        ExchangeRateType.MonthlyAverage => "Aylık Ortalama",
        ExchangeRateType.YearlyAverage => "Yıllık Ortalama",
        ExchangeRateType.MonthEnd => "Ay Sonu",
        ExchangeRateType.YearEnd => "Yıl Sonu",
        ExchangeRateType.Spot => "Spot",
        ExchangeRateType.Manual => "Manuel",
        _ => rateType.ToString()
    };
}

#endregion

#region Convert Currency

/// <summary>
/// Para birimi çevirme sorgusu (Convert Currency Query)
/// </summary>
public class ConvertCurrencyQuery : IRequest<Result<CurrencyConversionResultDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CurrencyConversionRequestDto Request { get; set; } = null!;
}

/// <summary>
/// ConvertCurrencyQuery Validator
/// </summary>
public class ConvertCurrencyQueryValidator : AbstractValidator<ConvertCurrencyQuery>
{
    public ConvertCurrencyQueryValidator()
    {
        RuleFor(x => x.Request).NotNull().WithMessage("Çevirme bilgileri zorunludur");
        RuleFor(x => x.Request.Amount)
            .GreaterThan(0).WithMessage("Tutar sıfırdan büyük olmalıdır");
        RuleFor(x => x.Request.SourceCurrency)
            .NotEmpty().WithMessage("Kaynak para birimi zorunludur")
            .Length(3).WithMessage("Kaynak para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Request.TargetCurrency)
            .NotEmpty().WithMessage("Hedef para birimi zorunludur")
            .Length(3).WithMessage("Hedef para birimi 3 karakter olmalıdır");
    }
}

/// <summary>
/// Handler for ConvertCurrencyQuery
/// </summary>
public class ConvertCurrencyQueryHandler : IRequestHandler<ConvertCurrencyQuery, Result<CurrencyConversionResultDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public ConvertCurrencyQueryHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<CurrencyConversionResultDto>> Handle(ConvertCurrencyQuery request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var sourceCurrency = req.SourceCurrency.ToUpperInvariant();
        var targetCurrency = req.TargetCurrency.ToUpperInvariant();
        var date = req.RateDate?.Date ?? DateTime.UtcNow.Date;

        // Same currency, no conversion needed
        if (sourceCurrency == targetCurrency)
        {
            return Result<CurrencyConversionResultDto>.Success(new CurrencyConversionResultDto
            {
                SourceAmount = req.Amount,
                SourceCurrency = sourceCurrency,
                ConvertedAmount = req.Amount,
                TargetCurrency = targetCurrency,
                ExchangeRate = 1m,
                RateDate = date,
                RateSource = ExchangeRateSource.Manual
            });
        }

        ExchangeRate? exchangeRate = null;

        // Try direct conversion (source -> target)
        exchangeRate = await _exchangeRateRepository.AsQueryable()
            .Where(r => r.SourceCurrency == sourceCurrency &&
                       r.TargetCurrency == targetCurrency &&
                       r.RateDate.Date <= date &&
                       r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (exchangeRate != null)
        {
            var rate = req.UseBuyingRate
                ? (exchangeRate.ForexBuying ?? exchangeRate.AverageRate)
                : (exchangeRate.ForexSelling ?? exchangeRate.AverageRate);

            var convertedAmount = req.Amount * rate / exchangeRate.Unit;

            return Result<CurrencyConversionResultDto>.Success(new CurrencyConversionResultDto
            {
                SourceAmount = req.Amount,
                SourceCurrency = sourceCurrency,
                ConvertedAmount = Math.Round(convertedAmount, 2),
                TargetCurrency = targetCurrency,
                ExchangeRate = rate,
                RateDate = exchangeRate.RateDate,
                RateSource = exchangeRate.Source
            });
        }

        // Try reverse conversion (target -> source)
        var reverseRate = await _exchangeRateRepository.AsQueryable()
            .Where(r => r.SourceCurrency == targetCurrency &&
                       r.TargetCurrency == sourceCurrency &&
                       r.RateDate.Date <= date &&
                       r.IsActive)
            .OrderByDescending(r => r.RateDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (reverseRate != null)
        {
            var rate = req.UseBuyingRate
                ? (reverseRate.ForexSelling ?? reverseRate.AverageRate)
                : (reverseRate.ForexBuying ?? reverseRate.AverageRate);

            if (rate == 0)
            {
                return Result<CurrencyConversionResultDto>.Failure(
                    Error.Validation("ExchangeRate", "Kur değeri sıfır olamaz"));
            }

            var convertedAmount = req.Amount * reverseRate.Unit / rate;

            return Result<CurrencyConversionResultDto>.Success(new CurrencyConversionResultDto
            {
                SourceAmount = req.Amount,
                SourceCurrency = sourceCurrency,
                ConvertedAmount = Math.Round(convertedAmount, 2),
                TargetCurrency = targetCurrency,
                ExchangeRate = 1 / rate,
                RateDate = reverseRate.RateDate,
                RateSource = reverseRate.Source
            });
        }

        // Try cross rate conversion via TRY
        if (sourceCurrency != "TRY" && targetCurrency != "TRY")
        {
            var sourceToTry = await _exchangeRateRepository.AsQueryable()
                .Where(r => r.SourceCurrency == sourceCurrency &&
                           r.TargetCurrency == "TRY" &&
                           r.RateDate.Date <= date &&
                           r.IsActive)
                .OrderByDescending(r => r.RateDate)
                .FirstOrDefaultAsync(cancellationToken);

            var targetToTry = await _exchangeRateRepository.AsQueryable()
                .Where(r => r.SourceCurrency == targetCurrency &&
                           r.TargetCurrency == "TRY" &&
                           r.RateDate.Date <= date &&
                           r.IsActive)
                .OrderByDescending(r => r.RateDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (sourceToTry != null && targetToTry != null)
            {
                var sourceRate = req.UseBuyingRate
                    ? (sourceToTry.ForexBuying ?? sourceToTry.AverageRate)
                    : (sourceToTry.ForexSelling ?? sourceToTry.AverageRate);

                var targetRate = req.UseBuyingRate
                    ? (targetToTry.ForexSelling ?? targetToTry.AverageRate)
                    : (targetToTry.ForexBuying ?? targetToTry.AverageRate);

                if (targetRate == 0)
                {
                    return Result<CurrencyConversionResultDto>.Failure(
                        Error.Validation("ExchangeRate", "Hedef para birimi kur değeri sıfır olamaz"));
                }

                var crossRate = (sourceRate / sourceToTry.Unit) / (targetRate / targetToTry.Unit);
                var convertedAmount = req.Amount * crossRate;

                return Result<CurrencyConversionResultDto>.Success(new CurrencyConversionResultDto
                {
                    SourceAmount = req.Amount,
                    SourceCurrency = sourceCurrency,
                    ConvertedAmount = Math.Round(convertedAmount, 2),
                    TargetCurrency = targetCurrency,
                    ExchangeRate = crossRate,
                    RateDate = sourceToTry.RateDate > targetToTry.RateDate ? targetToTry.RateDate : sourceToTry.RateDate,
                    RateSource = ExchangeRateSource.TCMB
                });
            }
        }

        return Result<CurrencyConversionResultDto>.Failure(
            Error.NotFound("ExchangeRate", $"{sourceCurrency}/{targetCurrency} için kur bulunamadı"));
    }
}

#endregion

#region Get Currencies

/// <summary>
/// Para birimlerini sorgulama (Get Currencies Query)
/// </summary>
public class GetCurrenciesQuery : IRequest<Result<List<CurrencyDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CurrencyFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetCurrenciesQuery
/// </summary>
public class GetCurrenciesQueryHandler : IRequestHandler<GetCurrenciesQuery, Result<List<CurrencyDto>>>
{
    private readonly IFinanceRepository<Currency> _currencyRepository;

    public GetCurrenciesQueryHandler(IFinanceRepository<Currency> currencyRepository)
    {
        _currencyRepository = currencyRepository;
    }

    public async Task<Result<List<CurrencyDto>>> Handle(GetCurrenciesQuery request, CancellationToken cancellationToken)
    {
        var query = _currencyRepository.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.IsoCode.ToLower().Contains(searchTerm) ||
                    c.Name.ToLower().Contains(searchTerm) ||
                    (c.NameTurkish != null && c.NameTurkish.ToLower().Contains(searchTerm)) ||
                    c.Symbol.ToLower().Contains(searchTerm));
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(c => c.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsBaseCurrency.HasValue)
            {
                query = query.Where(c => c.IsBaseCurrency == request.Filter.IsBaseCurrency.Value);
            }
        }

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "SortOrder";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "isocode" => sortDesc ? query.OrderByDescending(c => c.IsoCode) : query.OrderBy(c => c.IsoCode),
            "name" => sortDesc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "nameturkish" => sortDesc ? query.OrderByDescending(c => c.NameTurkish) : query.OrderBy(c => c.NameTurkish),
            _ => sortDesc ? query.OrderByDescending(c => c.SortOrder) : query.OrderBy(c => c.SortOrder)
        };

        // Apply pagination if specified
        if (request.Filter?.PageSize > 0)
        {
            var pageNumber = request.Filter.PageNumber > 0 ? request.Filter.PageNumber : 1;
            query = query
                .Skip((pageNumber - 1) * request.Filter.PageSize)
                .Take(request.Filter.PageSize);
        }

        var currencies = await query.ToListAsync(cancellationToken);

        var dtos = currencies.Select(c => new CurrencyDto
        {
            Id = c.Id,
            IsoCode = c.IsoCode,
            NumericCode = c.NumericCode,
            Name = c.Name,
            NameTurkish = c.NameTurkish,
            Symbol = c.Symbol,
            DecimalPlaces = c.DecimalPlaces,
            Country = c.Country,
            IsActive = c.IsActive,
            IsBaseCurrency = c.IsBaseCurrency,
            SortOrder = c.SortOrder
        }).ToList();

        return Result<List<CurrencyDto>>.Success(dtos);
    }
}

#endregion
