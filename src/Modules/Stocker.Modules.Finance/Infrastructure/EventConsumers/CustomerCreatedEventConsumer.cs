using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.Finance.Infrastructure.EventConsumers;

/// <summary>
/// Finance module consumer for CustomerCreatedEvent from CRM
/// Automatically creates a CurrentAccount (Cari Hesap) when a new CRM customer is created
/// </summary>
public class CustomerCreatedEventConsumer : IConsumer<CustomerCreatedEvent>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly ILogger<CustomerCreatedEventConsumer> _logger;

    public CustomerCreatedEventConsumer(
        IFinanceUnitOfWork unitOfWork,
        ILogger<CustomerCreatedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CustomerCreatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "Finance module processing CustomerCreatedEvent: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId);

        try
        {
            // Generate unique account code based on customer ID
            var accountCode = await GenerateAccountCodeAsync(@event.CustomerId, context.CancellationToken);

            // Determine tax liability type based on customer info
            var taxLiabilityType = DetermineTaxLiabilityType(@event);

            // Create new CurrentAccount for the CRM customer
            var currentAccount = new CurrentAccount(
                code: accountCode,
                name: @event.CompanyName,
                accountType: CurrentAccountType.Customer,
                taxLiabilityType: taxLiabilityType,
                currency: "TRY");

            // Set basic contact info from CRM customer
            currentAccount.UpdateBasicInfo(
                name: @event.CompanyName,
                shortName: TruncateCompanyName(@event.CompanyName),
                email: @event.Email,
                phone: @event.Phone,
                fax: null,
                website: @event.Website);

            // Set category based on industry
            if (!string.IsNullOrWhiteSpace(@event.Industry))
            {
                currentAccount.SetCategoryAndTags(@event.Industry, null);
            }

            // Set default payment terms (Net 30)
            currentAccount.UpdatePaymentTerms(
                PaymentTermType.Term,
                paymentDays: 30,
                discountRate: 0,
                VatRate.Twenty);

            // Set default credit limit based on annual revenue
            if (@event.AnnualRevenue.HasValue && @event.AnnualRevenue.Value > 0)
            {
                var creditLimitAmount = CalculateCreditLimit(@event.AnnualRevenue.Value);
                currentAccount.SetCreditLimit(Money.Create(creditLimitAmount, "TRY"));
            }

            // Note: CrmCustomerId is stored as int but event has Guid
            // We store a hash/conversion for linking
            // Actual implementation may need to adjust based on ID type in domain
            currentAccount.SetNotes($"Auto-created from CRM Customer: {@event.CustomerId}");

            // Add to repository and save
            await _unitOfWork.CurrentAccounts.AddAsync(currentAccount, context.CancellationToken);
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            _logger.LogInformation(
                "CurrentAccount created successfully for CRM Customer. AccountId={AccountId}, AccountCode={AccountCode}, CustomerId={CustomerId}",
                currentAccount.Id,
                currentAccount.Code,
                @event.CustomerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to create CurrentAccount for CRM Customer. CustomerId={CustomerId}, CompanyName={CompanyName}",
                @event.CustomerId,
                @event.CompanyName);
            throw;
        }
    }

    private async Task<string> GenerateAccountCodeAsync(Guid customerId, CancellationToken cancellationToken)
    {
        // Generate code format: C-YYYYMMDD-XXXX
        var datePrefix = DateTime.UtcNow.ToString("yyyyMMdd");
        var baseCode = $"C-{datePrefix}-";

        // Find the next available sequence number
        var sequence = 1;
        string accountCode;

        do
        {
            accountCode = $"{baseCode}{sequence:D4}";
            var exists = await _unitOfWork.CurrentAccounts.ExistsWithCodeAsync(accountCode, null, cancellationToken);
            if (!exists) break;
            sequence++;
        } while (sequence < 10000);

        return accountCode;
    }

    private static TaxLiabilityType DetermineTaxLiabilityType(CustomerCreatedEvent @event)
    {
        // Default to corporate for business customers
        // In a real scenario, this would be determined by additional customer data
        if (@event.NumberOfEmployees.HasValue && @event.NumberOfEmployees.Value > 0)
        {
            return TaxLiabilityType.LegalEntity;
        }

        return TaxLiabilityType.LegalEntity;
    }

    private static string TruncateCompanyName(string companyName)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            return string.Empty;

        // Get first 50 chars for short name
        return companyName.Length <= 50 ? companyName : companyName[..50];
    }

    private static decimal CalculateCreditLimit(decimal annualRevenue)
    {
        // Default credit limit: 10% of annual revenue, capped at 1,000,000 TRY
        var calculated = annualRevenue * 0.10m;
        return Math.Min(calculated, 1_000_000m);
    }
}
