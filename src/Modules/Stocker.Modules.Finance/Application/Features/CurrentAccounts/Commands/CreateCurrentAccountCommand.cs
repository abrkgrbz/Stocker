using FluentValidation;
using MediatR;
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
/// Validator for CreateCurrentAccountCommand
/// </summary>
public class CreateCurrentAccountCommandValidator : AbstractValidator<CreateCurrentAccountCommand>
{
    public CreateCurrentAccountCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID gereklidir");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Cari hesap bilgileri gereklidir");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Code)
                .NotEmpty().WithMessage("Cari hesap kodu gereklidir")
                .MaximumLength(50).WithMessage("Cari hesap kodu 50 karakteri aşamaz");

            RuleFor(x => x.Data.Name)
                .NotEmpty().WithMessage("Cari hesap adı gereklidir")
                .MaximumLength(200).WithMessage("Cari hesap adı 200 karakteri aşamaz");

            RuleFor(x => x.Data.Email)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.Data.Email))
                .WithMessage("Geçerli bir e-posta adresi giriniz");

            RuleFor(x => x.Data.TaxNumber)
                .Length(10).When(x => !string.IsNullOrEmpty(x.Data.TaxNumber))
                .WithMessage("Vergi numarası 10 karakter olmalıdır");

            RuleFor(x => x.Data.IdentityNumber)
                .Length(11).When(x => !string.IsNullOrEmpty(x.Data.IdentityNumber))
                .WithMessage("TC Kimlik numarası 11 karakter olmalıdır");

            RuleFor(x => x.Data.Currency)
                .NotEmpty().WithMessage("Para birimi gereklidir")
                .Must(c => c == "TRY" || c == "USD" || c == "EUR" || c == "GBP")
                .WithMessage("Geçerli bir para birimi seçiniz (TRY, USD, EUR, GBP)");

            RuleFor(x => x.Data.CreditLimit)
                .GreaterThanOrEqualTo(0).When(x => x.Data.CreditLimit.HasValue)
                .WithMessage("Kredi limiti negatif olamaz");

            RuleFor(x => x.Data.DiscountRate)
                .InclusiveBetween(0, 100)
                .WithMessage("İskonto oranı 0-100 arasında olmalıdır");

            RuleFor(x => x.Data.PaymentDays)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Ödeme vadesi negatif olamaz");
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
