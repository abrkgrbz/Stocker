using FluentValidation;
using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.CurrentAccounts.Commands;

/// <summary>
/// Command to update an existing current account
/// </summary>
public class UpdateCurrentAccountCommand : IRequest<Result<CurrentAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateCurrentAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateCurrentAccountCommand
/// </summary>
public class UpdateCurrentAccountCommandValidator : AbstractValidator<UpdateCurrentAccountCommand>
{
    public UpdateCurrentAccountCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID gereklidir");

        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Geçerli bir cari hesap ID'si gereklidir");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Cari hesap bilgileri gereklidir");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name)
                .NotEmpty().WithMessage("Cari hesap adı gereklidir")
                .MaximumLength(200).WithMessage("Cari hesap adı 200 karakteri aşamaz");

            RuleFor(x => x.Data.Email)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.Data.Email))
                .WithMessage("Geçerli bir e-posta adresi giriniz");

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
/// Handler for UpdateCurrentAccountCommand
/// </summary>
public class UpdateCurrentAccountCommandHandler : IRequestHandler<UpdateCurrentAccountCommand, Result<CurrentAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateCurrentAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CurrentAccountDto>> Handle(UpdateCurrentAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Id, cancellationToken);

        if (account == null)
        {
            return Result<CurrentAccountDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Id} ile cari hesap bulunamadı"));
        }

        // Update basic info
        account.UpdateBasicInfo(
            request.Data.Name ?? account.Name,
            request.Data.ShortName,
            request.Data.Email,
            request.Data.Phone,
            request.Data.Fax,
            request.Data.Website);

        // Update tax info
        account.UpdateTaxInfo(
            request.Data.TaxOffice,
            request.Data.TaxNumber,
            request.Data.IdentityNumber,
            request.Data.TradeRegistryNumber,
            request.Data.MersisNumber);

        // Update e-invoice info
        account.UpdateEInvoiceInfo(
            request.Data.IsEInvoiceRegistered ?? account.IsEInvoiceRegistered,
            request.Data.EInvoiceAlias,
            request.Data.KepAddress);

        // Update address
        account.UpdateAddress(
            request.Data.Address,
            request.Data.District,
            request.Data.City,
            request.Data.Country,
            request.Data.PostalCode);

        // Update payment terms
        account.UpdatePaymentTerms(
            request.Data.PaymentTermType ?? account.PaymentTermType,
            request.Data.PaymentDays ?? account.PaymentDays,
            request.Data.DiscountRate ?? account.DiscountRate,
            request.Data.DefaultVatRate ?? account.DefaultVatRate);

        // Set withholding
        account.SetWithholding(request.Data.ApplyWithholding ?? account.ApplyWithholding, request.Data.WithholdingCode);

        // Set credit limit
        if (request.Data.CreditLimit.HasValue)
        {
            account.SetCreditLimit(Money.Create(request.Data.CreditLimit.Value, account.Currency));
        }

        // Set category and tags
        account.SetCategoryAndTags(request.Data.Category, request.Data.Tags);
        account.SetNotes(request.Data.Notes);

        // Link accounts
        account.LinkToAccounts(request.Data.ReceivableAccountId, request.Data.PayableAccountId);

        if (request.Data.CrmCustomerId.HasValue)
        {
            account.LinkToCrm(request.Data.CrmCustomerId.Value);
        }

        if (request.Data.PurchaseSupplierId.HasValue)
        {
            account.LinkToPurchase(request.Data.PurchaseSupplierId.Value);
        }

        // Save
        _unitOfWork.CurrentAccounts.Update(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(account);

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
