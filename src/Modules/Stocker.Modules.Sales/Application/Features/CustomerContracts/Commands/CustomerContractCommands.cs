using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerContracts.Commands;

public record CreateCustomerContractCommand : IRequest<Result<CustomerContractDto>>
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public ContractType ContractType { get; init; }
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public DateTime SignedDate { get; init; }
    public int DefaultPaymentDueDays { get; init; } = 30;
    public Guid? PriceListId { get; init; }
    public decimal? GeneralDiscountPercentage { get; init; }
    public decimal? CreditLimitAmount { get; init; }
    public string CreditLimitCurrency { get; init; } = "TRY";
    public bool AutoRenewal { get; init; }
    public int? RenewalPeriodMonths { get; init; }
    public int? RenewalNoticeBeforeDays { get; init; }
    public Guid? SalesRepresentativeId { get; init; }
    public string? SalesRepresentativeName { get; init; }
    public string? CustomerSignatory { get; init; }
    public string? CustomerSignatoryTitle { get; init; }
    public string? CompanySignatory { get; init; }
    public string? CompanySignatoryTitle { get; init; }
    public string? SpecialTerms { get; init; }

    // SLA Configuration
    public ServiceLevelAgreement ServiceLevel { get; init; } = ServiceLevelAgreement.None;
    public int? ResponseTimeHours { get; init; }
    public int? ResolutionTimeHours { get; init; }
    public string? SupportHours { get; init; }
    public SupportPriority SupportPriority { get; init; } = SupportPriority.Normal;
}

public record UpdateCustomerContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime EndDate { get; init; }
    public int DefaultPaymentDueDays { get; init; }
    public Guid? PriceListId { get; init; }
    public decimal? GeneralDiscountPercentage { get; init; }
    public bool AutoRenewal { get; init; }
    public int? RenewalPeriodMonths { get; init; }
    public int? RenewalNoticeBeforeDays { get; init; }
    public Guid? SalesRepresentativeId { get; init; }
    public string? SalesRepresentativeName { get; init; }
    public string? SpecialTerms { get; init; }
}

public record ActivateContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
}

public record SuspendContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record TerminateContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public TerminationType TerminationType { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record RenewContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public int? ExtensionMonths { get; init; }
}

public record UpdateCreditLimitCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? Notes { get; init; }
}

public record BlockContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record UnblockContractCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public string? Notes { get; init; }
}

public record ConfigureSLACommand : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
    public ServiceLevelAgreement ServiceLevel { get; init; }
    public int? ResponseTimeHours { get; init; }
    public int? ResolutionTimeHours { get; init; }
    public string? SupportHours { get; init; }
    public SupportPriority SupportPriority { get; init; } = SupportPriority.Normal;
}

public record AddPriceAgreementCommand : IRequest<Result<CustomerContractDto>>
{
    public Guid ContractId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal SpecialPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? DiscountPercentage { get; init; }
    public decimal? MinimumQuantity { get; init; }
}

public record DeleteCustomerContractCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
