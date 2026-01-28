using FluentValidation;
using MediatR;
using Stocker.Application.Common.Validators;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.CurrentAccounts.Commands;

/// <summary>
/// Command to create a new current account
/// </summary>
public class CreateCurrentAccountCommand : IRequest<Result<CurrentAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCurrentAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateCurrentAccountCommand - Türkçe doğrulama kuralları
/// </summary>
public class CreateCurrentAccountCommandValidator : AbstractValidator<CreateCurrentAccountCommand>
{
    public CreateCurrentAccountCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmptyGuid();

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Cari hesap bilgileri zorunludur.");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Code)
                .NotEmpty().WithMessage("Cari hesap kodu zorunludur.")
                .ValidCode(2, 50);

            RuleFor(x => x.Data.Name)
                .NotEmpty().WithMessage("Cari hesap adı zorunludur.")
                .MaximumLength(200).WithMessage("Cari hesap adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Data.Email)
                .EmailAddress().WithMessage("Geçersiz e-posta formatı.")
                .When(x => !string.IsNullOrEmpty(x.Data.Email));

            // Türk Vergi Numarası doğrulaması (10 haneli + algoritma kontrolü)
            RuleFor(x => x.Data.TaxNumber)
                .TurkishTaxNumber()
                .When(x => !string.IsNullOrEmpty(x.Data.TaxNumber));

            // TC Kimlik Numarası doğrulaması (11 haneli + algoritma kontrolü)
            RuleFor(x => x.Data.IdentityNumber)
                .TurkishNationalId()
                .When(x => !string.IsNullOrEmpty(x.Data.IdentityNumber));

            // Telefon numarası doğrulaması
            RuleFor(x => x.Data.Phone)
                .TurkishPhoneNumber()
                .When(x => !string.IsNullOrEmpty(x.Data.Phone));

            RuleFor(x => x.Data.Currency)
                .NotEmpty().WithMessage("Para birimi zorunludur.")
                .Must(c => c == "TRY" || c == "USD" || c == "EUR" || c == "GBP")
                .WithMessage("Geçerli bir para birimi seçiniz (TRY, USD, EUR, GBP).");

            // Kredi limiti doğrulaması
            RuleFor(x => x.Data.CreditLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Kredi limiti negatif olamaz.")
                .When(x => x.Data.CreditLimit.HasValue);

            // İskonto oranı doğrulaması
            RuleFor(x => x.Data.DiscountRate)
                .ValidPercentage();

            // Ödeme vadesi doğrulaması
            RuleFor(x => x.Data.PaymentDays)
                .InclusiveBetween(0, 365).WithMessage("Ödeme vadesi 0 ile 365 gün arasında olmalıdır.");
        });
    }
}

/// <summary>
/// Handler for CreateCurrentAccountCommand
/// </summary>
public class CreateCurrentAccountCommandHandler : IRequestHandler<CreateCurrentAccountCommand, Result<CurrentAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateCurrentAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CurrentAccountDto>> Handle(CreateCurrentAccountCommand request, CancellationToken cancellationToken)
    {
        // Check if code already exists
        var codeExists = await _unitOfWork.CurrentAccounts.ExistsWithCodeAsync(
            request.Data.Code,
            null,
            cancellationToken);

        if (codeExists)
        {
            return Result<CurrentAccountDto>.Failure(
                Error.Conflict("CurrentAccount.Code", "Bu cari hesap kodu zaten kullanılmaktadır"));
        }

        // Create current account
        var currentAccount = new CurrentAccount(
            request.Data.Code,
            request.Data.Name,
            request.Data.AccountType,
            request.Data.TaxLiabilityType,
            request.Data.Currency);

        // Update basic info
        currentAccount.UpdateBasicInfo(
            request.Data.Name,
            request.Data.ShortName,
            request.Data.Email,
            request.Data.Phone,
            request.Data.Fax,
            request.Data.Website);

        // Update tax info
        currentAccount.UpdateTaxInfo(
            request.Data.TaxOffice,
            request.Data.TaxNumber,
            request.Data.IdentityNumber,
            request.Data.TradeRegistryNumber,
            request.Data.MersisNumber);

        // Update e-invoice info
        currentAccount.UpdateEInvoiceInfo(
            request.Data.IsEInvoiceRegistered,
            request.Data.EInvoiceAlias,
            request.Data.KepAddress);

        // Update address
        currentAccount.UpdateAddress(
            request.Data.Address,
            request.Data.District,
            request.Data.City,
            request.Data.Country,
            request.Data.PostalCode);

        // Update payment terms
        currentAccount.UpdatePaymentTerms(
            request.Data.PaymentTermType,
            request.Data.PaymentDays,
            request.Data.DiscountRate,
            request.Data.DefaultVatRate);

        // Set withholding
        if (request.Data.ApplyWithholding)
        {
            currentAccount.SetWithholding(true, request.Data.WithholdingCode);
        }

        // Set credit limit
        if (request.Data.CreditLimit.HasValue && request.Data.CreditLimit.Value > 0)
        {
            currentAccount.SetCreditLimit(Money.Create(request.Data.CreditLimit.Value, request.Data.Currency));
        }

        // Set category and tags
        currentAccount.SetCategoryAndTags(request.Data.Category, request.Data.Tags);
        currentAccount.SetNotes(request.Data.Notes);

        // Link accounts
        currentAccount.LinkToAccounts(request.Data.ReceivableAccountId, request.Data.PayableAccountId);

        if (request.Data.CrmCustomerId.HasValue)
        {
            currentAccount.LinkToCrm(request.Data.CrmCustomerId.Value);
        }

        if (request.Data.PurchaseSupplierId.HasValue)
        {
            currentAccount.LinkToPurchase(request.Data.PurchaseSupplierId.Value);
        }

        // Save
        await _unitOfWork.CurrentAccounts.AddAsync(currentAccount, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(currentAccount);

        return Result<CurrentAccountDto>.Success(dto);
    }

    private static CurrentAccountDto MapToDto(CurrentAccount account)
    {
        return new CurrentAccountDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            ShortName = account.ShortName,
            AccountType = account.AccountType,
            TaxLiabilityType = account.TaxLiabilityType,
            TaxOffice = account.TaxOffice,
            TaxNumber = account.TaxNumber,
            IdentityNumber = account.IdentityNumber,
            TradeRegistryNumber = account.TradeRegistryNumber,
            MersisNumber = account.MersisNumber,
            IsEInvoiceRegistered = account.IsEInvoiceRegistered,
            EInvoiceAlias = account.EInvoiceAlias,
            KepAddress = account.KepAddress,
            Email = account.Email,
            Phone = account.Phone,
            Fax = account.Fax,
            Website = account.Website,
            Address = account.Address,
            District = account.District,
            City = account.City,
            Country = account.Country,
            PostalCode = account.PostalCode,
            Currency = account.Currency,
            DebitBalance = account.DebitBalance.Amount,
            CreditBalance = account.CreditBalance.Amount,
            Balance = account.Balance.Amount,
            CreditLimit = account.CreditLimit.Amount,
            UsedCredit = account.UsedCredit.Amount,
            AvailableCredit = account.AvailableCredit.Amount,
            RiskStatus = account.RiskStatus,
            RiskNotes = account.RiskNotes,
            PaymentTermType = account.PaymentTermType,
            PaymentDays = account.PaymentDays,
            DiscountRate = account.DiscountRate,
            DefaultVatRate = account.DefaultVatRate,
            ApplyWithholding = account.ApplyWithholding,
            WithholdingCode = account.WithholdingCode,
            Status = account.Status,
            Category = account.Category,
            Tags = account.Tags,
            Notes = account.Notes,
            ReceivableAccountId = account.ReceivableAccountId,
            PayableAccountId = account.PayableAccountId,
            CrmCustomerId = account.CrmCustomerId,
            PurchaseSupplierId = account.PurchaseSupplierId,
            CreatedAt = account.CreatedDate,
            UpdatedAt = account.UpdatedDate
        };
    }
}
