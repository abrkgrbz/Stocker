using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.ExchangeRates.Commands;

#region Create Exchange Rate

/// <summary>
/// Yeni döviz kuru oluşturma komutu (Create Exchange Rate Command)
/// </summary>
public class CreateExchangeRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateExchangeRateDto Data { get; set; } = null!;
}

/// <summary>
/// CreateExchangeRateCommand Validator
/// </summary>
public class CreateExchangeRateCommandValidator : AbstractValidator<CreateExchangeRateCommand>
{
    public CreateExchangeRateCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Kur bilgileri zorunludur");
        RuleFor(x => x.Data.SourceCurrency)
            .NotEmpty().WithMessage("Kaynak para birimi zorunludur")
            .Length(3).WithMessage("Kaynak para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Data.TargetCurrency)
            .NotEmpty().WithMessage("Hedef para birimi zorunludur")
            .Length(3).WithMessage("Hedef para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Data.RateDate)
            .NotEmpty().WithMessage("Kur tarihi zorunludur")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Kur tarihi gelecekte olamaz");
        RuleFor(x => x.Data.AverageRate)
            .GreaterThan(0).WithMessage("Ortalama kur sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.Unit)
            .GreaterThan(0).WithMessage("Birim sıfırdan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for CreateExchangeRateCommand
/// </summary>
public class CreateExchangeRateCommandHandler : IRequestHandler<CreateExchangeRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public CreateExchangeRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(CreateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check for duplicate rate
        var existingRate = await _exchangeRateRepository.FirstOrDefaultAsync(
            r => r.SourceCurrency == data.SourceCurrency.ToUpperInvariant() &&
                 r.TargetCurrency == data.TargetCurrency.ToUpperInvariant() &&
                 r.RateDate.Date == data.RateDate.Date &&
                 r.RateType == data.RateType &&
                 r.Source == data.Source,
            cancellationToken);

        if (existingRate != null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.Conflict("ExchangeRate", "Bu tarih ve kur tipi için aynı kaynaktan kur zaten mevcut"));
        }

        var exchangeRate = new ExchangeRate(
            data.SourceCurrency,
            data.TargetCurrency,
            data.RateDate,
            data.AverageRate,
            data.RateType,
            data.Source,
            data.Unit);

        if (data.ForexBuying.HasValue || data.ForexSelling.HasValue)
        {
            exchangeRate.SetForexRates(data.ForexBuying, data.ForexSelling);
        }

        if (data.BanknoteBuying.HasValue || data.BanknoteSelling.HasValue)
        {
            exchangeRate.SetBanknoteRates(data.BanknoteBuying, data.BanknoteSelling);
        }

        if (!string.IsNullOrEmpty(data.Notes))
        {
            exchangeRate.SetNotes(data.Notes);
        }

        await _exchangeRateRepository.AddAsync(exchangeRate, cancellationToken);

        var dto = MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }

    internal static ExchangeRateDto MapToDto(ExchangeRate rate)
    {
        return new ExchangeRateDto
        {
            Id = rate.Id,
            SourceCurrency = rate.SourceCurrency,
            TargetCurrency = rate.TargetCurrency,
            CurrencyIsoCode = rate.CurrencyIsoCode,
            RateDate = rate.RateDate,
            RateType = rate.RateType,
            RateTypeName = GetRateTypeName(rate.RateType),
            ForexBuying = rate.ForexBuying,
            ForexSelling = rate.ForexSelling,
            BanknoteBuying = rate.BanknoteBuying,
            BanknoteSelling = rate.BanknoteSelling,
            AverageRate = rate.AverageRate,
            CrossRate = rate.CrossRate,
            Unit = rate.Unit,
            IsTcmbRate = rate.IsTcmbRate,
            TcmbBulletinNumber = rate.TcmbBulletinNumber,
            CurrencyName = rate.CurrencyName,
            CurrencyNameTurkish = rate.CurrencyNameTurkish,
            PreviousRate = rate.PreviousRate,
            ChangeAmount = rate.ChangeAmount,
            ChangePercentage = rate.ChangePercentage,
            Trend = rate.Trend,
            TrendName = GetTrendName(rate.Trend),
            Source = rate.Source,
            SourceName = GetSourceName(rate.Source),
            IsManualEntry = rate.IsManualEntry,
            IsActive = rate.IsActive,
            IsValid = rate.IsValid,
            IsDefaultForDate = rate.IsDefaultForDate,
            Notes = rate.Notes,
            CreatedAt = rate.CreatedDate,
            UpdatedAt = rate.UpdatedDate
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

    private static string GetTrendName(ExchangeRateTrend trend) => trend switch
    {
        ExchangeRateTrend.Rising => "Yükseliyor",
        ExchangeRateTrend.Falling => "Düşüyor",
        ExchangeRateTrend.Stable => "Sabit",
        _ => trend.ToString()
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

#region Create TCMB Rate

/// <summary>
/// TCMB döviz kuru oluşturma komutu (Create TCMB Exchange Rate Command)
/// </summary>
public class CreateTcmbRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateTcmbRateDto Data { get; set; } = null!;
}

/// <summary>
/// CreateTcmbRateCommand Validator
/// </summary>
public class CreateTcmbRateCommandValidator : AbstractValidator<CreateTcmbRateCommand>
{
    public CreateTcmbRateCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("TCMB kur bilgileri zorunludur");
        RuleFor(x => x.Data.CurrencyCode)
            .NotEmpty().WithMessage("Para birimi kodu zorunludur")
            .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır");
        RuleFor(x => x.Data.Date)
            .NotEmpty().WithMessage("Kur tarihi zorunludur");
        RuleFor(x => x.Data.ForexBuying)
            .GreaterThan(0).WithMessage("Döviz alış kuru sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.ForexSelling)
            .GreaterThan(0).WithMessage("Döviz satış kuru sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.Unit)
            .GreaterThan(0).WithMessage("Birim sıfırdan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for CreateTcmbRateCommand
/// </summary>
public class CreateTcmbRateCommandHandler : IRequestHandler<CreateTcmbRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public CreateTcmbRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(CreateTcmbRateCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Check for duplicate TCMB rate
        var existingRate = await _exchangeRateRepository.FirstOrDefaultAsync(
            r => r.SourceCurrency == data.CurrencyCode.ToUpperInvariant() &&
                 r.TargetCurrency == "TRY" &&
                 r.RateDate.Date == data.Date.Date &&
                 r.IsTcmbRate,
            cancellationToken);

        if (existingRate != null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.Conflict("ExchangeRate", "Bu tarih için TCMB kuru zaten mevcut"));
        }

        // Use factory method
        var exchangeRate = ExchangeRate.CreateTcmbRate(
            data.CurrencyCode,
            data.Date,
            data.ForexBuying,
            data.ForexSelling,
            data.BanknoteBuying,
            data.BanknoteSelling,
            data.BulletinNumber,
            data.Unit);

        if (!string.IsNullOrEmpty(data.CurrencyName) || !string.IsNullOrEmpty(data.CurrencyNameTurkish))
        {
            exchangeRate.SetTcmbInfo(data.BulletinNumber, data.CurrencyName, data.CurrencyNameTurkish);
        }

        await _exchangeRateRepository.AddAsync(exchangeRate, cancellationToken);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Create Manual Rate

/// <summary>
/// Manuel döviz kuru oluşturma komutu (Create Manual Exchange Rate Command)
/// </summary>
public class CreateManualRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateManualRateDto Data { get; set; } = null!;
}

/// <summary>
/// CreateManualRateCommand Validator
/// </summary>
public class CreateManualRateCommandValidator : AbstractValidator<CreateManualRateCommand>
{
    public CreateManualRateCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Manuel kur bilgileri zorunludur");
        RuleFor(x => x.Data.SourceCurrency)
            .NotEmpty().WithMessage("Kaynak para birimi zorunludur")
            .Length(3).WithMessage("Kaynak para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Data.TargetCurrency)
            .NotEmpty().WithMessage("Hedef para birimi zorunludur")
            .Length(3).WithMessage("Hedef para birimi 3 karakter olmalıdır");
        RuleFor(x => x.Data.Date)
            .NotEmpty().WithMessage("Kur tarihi zorunludur");
        RuleFor(x => x.Data.Rate)
            .GreaterThan(0).WithMessage("Kur değeri sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.UserId)
            .GreaterThan(0).WithMessage("Kullanıcı ID zorunludur");
    }
}

/// <summary>
/// Handler for CreateManualRateCommand
/// </summary>
public class CreateManualRateCommandHandler : IRequestHandler<CreateManualRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public CreateManualRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(CreateManualRateCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Use factory method
        var exchangeRate = ExchangeRate.CreateManualRate(
            data.SourceCurrency,
            data.TargetCurrency,
            data.Date,
            data.Rate,
            data.UserId,
            data.Notes);

        await _exchangeRateRepository.AddAsync(exchangeRate, cancellationToken);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Update Exchange Rate

/// <summary>
/// Döviz kuru güncelleme komutu (Update Exchange Rate Command)
/// </summary>
public class UpdateExchangeRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateExchangeRateDto Data { get; set; } = null!;
}

/// <summary>
/// UpdateExchangeRateCommand Validator
/// </summary>
public class UpdateExchangeRateCommandValidator : AbstractValidator<UpdateExchangeRateCommand>
{
    public UpdateExchangeRateCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kur ID'si giriniz");
        RuleFor(x => x.Data).NotNull().WithMessage("Güncelleme bilgileri zorunludur");
        RuleFor(x => x.Data.AverageRate)
            .GreaterThan(0).When(x => x.Data?.AverageRate.HasValue == true)
            .WithMessage("Ortalama kur sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.ForexBuying)
            .GreaterThan(0).When(x => x.Data?.ForexBuying.HasValue == true)
            .WithMessage("Döviz alış kuru sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.ForexSelling)
            .GreaterThan(0).When(x => x.Data?.ForexSelling.HasValue == true)
            .WithMessage("Döviz satış kuru sıfırdan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for UpdateExchangeRateCommand
/// </summary>
public class UpdateExchangeRateCommandHandler : IRequestHandler<UpdateExchangeRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public UpdateExchangeRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(UpdateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        if (!exchangeRate.IsActive)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.Validation("ExchangeRate.Status", "Pasif döviz kurları güncellenemez"));
        }

        var data = request.Data;

        if (data.ForexBuying.HasValue || data.ForexSelling.HasValue)
        {
            exchangeRate.SetForexRates(
                data.ForexBuying ?? exchangeRate.ForexBuying,
                data.ForexSelling ?? exchangeRate.ForexSelling);
        }

        if (data.BanknoteBuying.HasValue || data.BanknoteSelling.HasValue)
        {
            exchangeRate.SetBanknoteRates(
                data.BanknoteBuying ?? exchangeRate.BanknoteBuying,
                data.BanknoteSelling ?? exchangeRate.BanknoteSelling);
        }

        if (data.CrossRate.HasValue)
        {
            exchangeRate.SetCrossRate(data.CrossRate);
        }

        if (data.Notes != null)
        {
            exchangeRate.SetNotes(data.Notes);
        }

        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Set Forex Rates

/// <summary>
/// Döviz kurları ayarlama komutu (Set Forex Rates Command)
/// </summary>
public class SetForexRatesCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public SetRatesDto Data { get; set; } = null!;
}

/// <summary>
/// SetForexRatesCommand Validator
/// </summary>
public class SetForexRatesCommandValidator : AbstractValidator<SetForexRatesCommand>
{
    public SetForexRatesCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kur ID'si giriniz");
        RuleFor(x => x.Data).NotNull().WithMessage("Kur bilgileri zorunludur");
        RuleFor(x => x.Data.Buying)
            .GreaterThan(0).When(x => x.Data?.Buying.HasValue == true)
            .WithMessage("Döviz alış kuru sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.Selling)
            .GreaterThan(0).When(x => x.Data?.Selling.HasValue == true)
            .WithMessage("Döviz satış kuru sıfırdan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for SetForexRatesCommand
/// </summary>
public class SetForexRatesCommandHandler : IRequestHandler<SetForexRatesCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public SetForexRatesCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(SetForexRatesCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        exchangeRate.SetForexRates(request.Data.Buying, request.Data.Selling);
        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Set Banknote Rates

/// <summary>
/// Efektif kurları ayarlama komutu (Set Banknote Rates Command)
/// </summary>
public class SetBanknoteRatesCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public SetRatesDto Data { get; set; } = null!;
}

/// <summary>
/// SetBanknoteRatesCommand Validator
/// </summary>
public class SetBanknoteRatesCommandValidator : AbstractValidator<SetBanknoteRatesCommand>
{
    public SetBanknoteRatesCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir kur ID'si giriniz");
        RuleFor(x => x.Data).NotNull().WithMessage("Efektif kur bilgileri zorunludur");
        RuleFor(x => x.Data.Buying)
            .GreaterThan(0).When(x => x.Data?.Buying.HasValue == true)
            .WithMessage("Efektif alış kuru sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.Selling)
            .GreaterThan(0).When(x => x.Data?.Selling.HasValue == true)
            .WithMessage("Efektif satış kuru sıfırdan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for SetBanknoteRatesCommand
/// </summary>
public class SetBanknoteRatesCommandHandler : IRequestHandler<SetBanknoteRatesCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public SetBanknoteRatesCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(SetBanknoteRatesCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        exchangeRate.SetBanknoteRates(request.Data.Buying, request.Data.Selling);
        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Set As Default For Date

/// <summary>
/// Varsayılan kur olarak ayarlama komutu (Set As Default For Date Command)
/// </summary>
public class SetAsDefaultForDateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SetAsDefaultForDateCommand
/// </summary>
public class SetAsDefaultForDateCommandHandler : IRequestHandler<SetAsDefaultForDateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public SetAsDefaultForDateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(SetAsDefaultForDateCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        // Remove default from other rates for the same currency and date
        var existingDefaults = await _exchangeRateRepository.FindAsync(
            r => r.SourceCurrency == exchangeRate.SourceCurrency &&
                 r.TargetCurrency == exchangeRate.TargetCurrency &&
                 r.RateDate.Date == exchangeRate.RateDate.Date &&
                 r.IsDefaultForDate &&
                 r.Id != exchangeRate.Id,
            cancellationToken);

        foreach (var existingDefault in existingDefaults)
        {
            existingDefault.RemoveDefaultForDate();
            _exchangeRateRepository.Update(existingDefault);
        }

        exchangeRate.SetAsDefaultForDate();
        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Activate Exchange Rate

/// <summary>
/// Döviz kuru aktifleştirme komutu (Activate Exchange Rate Command)
/// </summary>
public class ActivateExchangeRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateExchangeRateCommand
/// </summary>
public class ActivateExchangeRateCommandHandler : IRequestHandler<ActivateExchangeRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public ActivateExchangeRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(ActivateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        if (!exchangeRate.IsValid)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.Validation("ExchangeRate.Status", "Geçersiz döviz kurları aktifleştirilemez"));
        }

        exchangeRate.Activate();
        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Deactivate Exchange Rate

/// <summary>
/// Döviz kuru pasifleştirme komutu (Deactivate Exchange Rate Command)
/// </summary>
public class DeactivateExchangeRateCommand : IRequest<Result<ExchangeRateDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateExchangeRateCommand
/// </summary>
public class DeactivateExchangeRateCommandHandler : IRequestHandler<DeactivateExchangeRateCommand, Result<ExchangeRateDto>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public DeactivateExchangeRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<ExchangeRateDto>> Handle(DeactivateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        if (exchangeRate.IsDefaultForDate)
        {
            return Result<ExchangeRateDto>.Failure(
                Error.Validation("ExchangeRate.Status", "Varsayılan kur pasifleştirilemez. Önce başka bir kuru varsayılan olarak ayarlayın."));
        }

        exchangeRate.Deactivate();
        _exchangeRateRepository.Update(exchangeRate);

        var dto = CreateExchangeRateCommandHandler.MapToDto(exchangeRate);
        return Result<ExchangeRateDto>.Success(dto);
    }
}

#endregion

#region Delete Exchange Rate

/// <summary>
/// Döviz kuru silme komutu (Delete Exchange Rate Command)
/// </summary>
public class DeleteExchangeRateCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteExchangeRateCommand
/// </summary>
public class DeleteExchangeRateCommandHandler : IRequestHandler<DeleteExchangeRateCommand, Result<bool>>
{
    private readonly IFinanceRepository<ExchangeRate> _exchangeRateRepository;

    public DeleteExchangeRateCommandHandler(IFinanceRepository<ExchangeRate> exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<Result<bool>> Handle(DeleteExchangeRateCommand request, CancellationToken cancellationToken)
    {
        var exchangeRate = await _exchangeRateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (exchangeRate == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("ExchangeRate", $"ID {request.Id} ile döviz kuru bulunamadı"));
        }

        if (exchangeRate.IsDefaultForDate)
        {
            return Result<bool>.Failure(
                Error.Validation("ExchangeRate.Delete", "Varsayılan kur silinemez. Önce başka bir kuru varsayılan olarak ayarlayın."));
        }

        if (exchangeRate.IsTcmbRate)
        {
            return Result<bool>.Failure(
                Error.Validation("ExchangeRate.Delete", "TCMB kurları silinemez, sadece pasifleştirilebilir."));
        }

        _exchangeRateRepository.Remove(exchangeRate);

        return Result<bool>.Success(true);
    }
}

#endregion
