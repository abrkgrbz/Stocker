using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record CustomerContractDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ContractType { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerTaxNumber { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public DateTime SignedDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal? ContractValue { get; init; }
    public string? ContractValueCurrency { get; init; }
    public decimal? MinimumAnnualCommitment { get; init; }
    public Guid? PriceListId { get; init; }
    public decimal? GeneralDiscountPercentage { get; init; }
    public int DefaultPaymentDueDays { get; init; }
    public decimal? CreditLimit { get; init; }
    public string? CreditLimitCurrency { get; init; }
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
    public DateTime? TerminatedDate { get; init; }
    public string? TerminationReason { get; init; }
    public string? TerminationType { get; init; }

    // Phase 3: SLA Properties
    public string ServiceLevel { get; init; } = "None";
    public int? ResponseTimeHours { get; init; }
    public int? ResolutionTimeHours { get; init; }
    public string? SupportHours { get; init; }
    public string? DedicatedSupportContact { get; init; }
    public string SupportPriority { get; init; } = "Normal";
    public bool IncludesOnSiteSupport { get; init; }
    public decimal CurrentCreditBalance { get; init; }
    public decimal AvailableCredit { get; init; }
    public DateTime? CreditLimitLastReviewDate { get; init; }
    public int RenewalGracePeriodDays { get; init; }
    public bool IsBlocked { get; init; }
    public string? BlockReason { get; init; }

    public int DaysUntilExpiration { get; init; }
    public bool IsActive { get; init; }
    public bool IsInGracePeriod { get; init; }
    public List<ContractPriceAgreementDto> PriceAgreements { get; init; } = new();
    public List<ContractPaymentTermDto> PaymentTerms { get; init; } = new();

    public static CustomerContractDto FromEntity(CustomerContract entity)
    {
        return new CustomerContractDto
        {
            Id = entity.Id,
            ContractNumber = entity.ContractNumber,
            Title = entity.Title,
            Description = entity.Description,
            ContractType = entity.ContractType.ToString(),
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            CustomerTaxNumber = entity.CustomerTaxNumber,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            SignedDate = entity.SignedDate,
            Status = entity.Status.ToString(),
            ContractValue = entity.ContractValue?.Amount,
            ContractValueCurrency = entity.ContractValue?.Currency,
            MinimumAnnualCommitment = entity.MinimumAnnualCommitment?.Amount,
            PriceListId = entity.PriceListId,
            GeneralDiscountPercentage = entity.GeneralDiscountPercentage,
            DefaultPaymentDueDays = entity.DefaultPaymentDueDays,
            CreditLimit = entity.CreditLimit?.Amount,
            CreditLimitCurrency = entity.CreditLimit?.Currency,
            AutoRenewal = entity.AutoRenewal,
            RenewalPeriodMonths = entity.RenewalPeriodMonths,
            RenewalNoticeBeforeDays = entity.RenewalNoticeBeforeDays,
            SalesRepresentativeId = entity.SalesRepresentativeId,
            SalesRepresentativeName = entity.SalesRepresentativeName,
            CustomerSignatory = entity.CustomerSignatory,
            CustomerSignatoryTitle = entity.CustomerSignatoryTitle,
            CompanySignatory = entity.CompanySignatory,
            CompanySignatoryTitle = entity.CompanySignatoryTitle,
            SpecialTerms = entity.SpecialTerms,
            TerminatedDate = entity.TerminatedDate,
            TerminationReason = entity.TerminationReason,
            TerminationType = entity.TerminationType?.ToString(),
            ServiceLevel = entity.ServiceLevel.ToString(),
            ResponseTimeHours = entity.ResponseTimeHours,
            ResolutionTimeHours = entity.ResolutionTimeHours,
            SupportHours = entity.SupportHours,
            DedicatedSupportContact = entity.DedicatedSupportContact,
            SupportPriority = entity.SupportPriority.ToString(),
            IncludesOnSiteSupport = entity.IncludesOnSiteSupport,
            CurrentCreditBalance = entity.CurrentCreditBalance,
            AvailableCredit = entity.AvailableCredit,
            CreditLimitLastReviewDate = entity.CreditLimitLastReviewDate,
            RenewalGracePeriodDays = entity.RenewalGracePeriodDays,
            IsBlocked = entity.IsBlocked,
            BlockReason = entity.BlockReason,
            DaysUntilExpiration = entity.DaysUntilExpiration(),
            IsActive = entity.Status == ContractStatus.Active,
            IsInGracePeriod = entity.IsInGracePeriod(),
            PriceAgreements = entity.PriceAgreements.Select(ContractPriceAgreementDto.FromEntity).ToList(),
            PaymentTerms = entity.PaymentTerms.Select(ContractPaymentTermDto.FromEntity).ToList()
        };
    }
}

public record CustomerContractListDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string ContractType { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal? CreditLimit { get; init; }
    public decimal AvailableCredit { get; init; }
    public bool IsBlocked { get; init; }
    public int DaysUntilExpiration { get; init; }
    public bool RequiresRenewalNotification { get; init; }

    public static CustomerContractListDto FromEntity(CustomerContract entity)
    {
        return new CustomerContractListDto
        {
            Id = entity.Id,
            ContractNumber = entity.ContractNumber,
            Title = entity.Title,
            ContractType = entity.ContractType.ToString(),
            CustomerName = entity.CustomerName,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            Status = entity.Status.ToString(),
            CreditLimit = entity.CreditLimit?.Amount,
            AvailableCredit = entity.AvailableCredit,
            IsBlocked = entity.IsBlocked,
            DaysUntilExpiration = entity.DaysUntilExpiration(),
            RequiresRenewalNotification = entity.RequiresRenewalNotification()
        };
    }
}

public record ContractPriceAgreementDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal SpecialPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? DiscountPercentage { get; init; }
    public decimal? MinimumQuantity { get; init; }
    public bool IsActive { get; init; }

    public static ContractPriceAgreementDto FromEntity(ContractPriceAgreement entity)
    {
        return new ContractPriceAgreementDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            SpecialPrice = entity.SpecialPrice.Amount,
            Currency = entity.SpecialPrice.Currency,
            DiscountPercentage = entity.DiscountPercentage,
            MinimumQuantity = entity.MinimumQuantity,
            IsActive = entity.IsActive
        };
    }
}

public record ContractPaymentTermDto
{
    public Guid Id { get; init; }
    public string TermType { get; init; } = string.Empty;
    public int DueDays { get; init; }
    public decimal? EarlyPaymentDiscountPercentage { get; init; }
    public int? EarlyPaymentDiscountDays { get; init; }
    public bool IsDefault { get; init; }

    public static ContractPaymentTermDto FromEntity(ContractPaymentTerm entity)
    {
        return new ContractPaymentTermDto
        {
            Id = entity.Id,
            TermType = entity.TermType.ToString(),
            DueDays = entity.DueDays,
            EarlyPaymentDiscountPercentage = entity.EarlyPaymentDiscountPercentage,
            EarlyPaymentDiscountDays = entity.EarlyPaymentDiscountDays,
            IsDefault = entity.IsDefault
        };
    }
}
