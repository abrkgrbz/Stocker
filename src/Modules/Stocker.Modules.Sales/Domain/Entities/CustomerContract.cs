using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Müşteri Sözleşmesi - Satış anlaşmaları ve koşulları
/// Customer Contract - Sales agreements, terms, and conditions management
/// </summary>
public class CustomerContract : TenantAggregateRoot
{
    private readonly List<ContractPriceAgreement> _priceAgreements = new();
    private readonly List<ContractPaymentTerm> _paymentTerms = new();
    private readonly List<ContractCommitment> _commitments = new();
    private readonly List<ContractDocument> _documents = new();

    public string ContractNumber { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ContractType ContractType { get; private set; }
    public Guid CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerTaxNumber { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public DateTime SignedDate { get; private set; }
    public ContractStatus Status { get; private set; }
    public Money? ContractValue { get; private set; }
    public Money? MinimumAnnualCommitment { get; private set; }
    public Guid? PriceListId { get; private set; }
    public decimal? GeneralDiscountPercentage { get; private set; }
    public int DefaultPaymentDueDays { get; private set; }
    public Money? CreditLimit { get; private set; }
    public bool AutoRenewal { get; private set; }
    public int? RenewalPeriodMonths { get; private set; }
    public int? RenewalNoticeBeforeDays { get; private set; }
    public Guid? SalesRepresentativeId { get; private set; }
    public string? SalesRepresentativeName { get; private set; }
    public string? CustomerSignatory { get; private set; }
    public string? CustomerSignatoryTitle { get; private set; }
    public string? CompanySignatory { get; private set; }
    public string? CompanySignatoryTitle { get; private set; }
    public string? SpecialTerms { get; private set; }
    public string? InternalNotes { get; private set; }
    public DateTime? TerminatedDate { get; private set; }
    public string? TerminationReason { get; private set; }
    public TerminationType? TerminationType { get; private set; }

    public IReadOnlyCollection<ContractPriceAgreement> PriceAgreements => _priceAgreements.AsReadOnly();
    public IReadOnlyCollection<ContractPaymentTerm> PaymentTerms => _paymentTerms.AsReadOnly();
    public IReadOnlyCollection<ContractCommitment> Commitments => _commitments.AsReadOnly();
    public IReadOnlyCollection<ContractDocument> Documents => _documents.AsReadOnly();

    private CustomerContract() { }

    public static Result<CustomerContract> Create(
        Guid tenantId,
        string contractNumber,
        string title,
        ContractType contractType,
        Guid customerId,
        string customerName,
        DateTime startDate,
        DateTime endDate,
        DateTime signedDate,
        int defaultPaymentDueDays = 30,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(contractNumber))
            return Result<CustomerContract>.Failure(Error.Validation("Contract.Number", "Sözleşme numarası boş olamaz."));

        if (string.IsNullOrWhiteSpace(title))
            return Result<CustomerContract>.Failure(Error.Validation("Contract.Title", "Sözleşme başlığı boş olamaz."));

        if (endDate <= startDate)
            return Result<CustomerContract>.Failure(Error.Validation("Contract.EndDate", "Bitiş tarihi başlangıç tarihinden sonra olmalıdır."));

        var contract = new CustomerContract();
        contract.Id = Guid.NewGuid();
        contract.SetTenantId(tenantId);
        contract.ContractNumber = contractNumber;
        contract.Title = title;
        contract.Description = description;
        contract.ContractType = contractType;
        contract.CustomerId = customerId;
        contract.CustomerName = customerName;
        contract.StartDate = startDate;
        contract.EndDate = endDate;
        contract.SignedDate = signedDate;
        contract.DefaultPaymentDueDays = defaultPaymentDueDays;
        contract.Status = ContractStatus.Draft;

        return Result<CustomerContract>.Success(contract);
    }

    public Result Activate()
    {
        if (Status != ContractStatus.Draft && Status != ContractStatus.PendingApproval)
            return Result.Failure(Error.Conflict("Contract.Status", "Sadece taslak veya onay bekleyen sözleşmeler aktifleştirilebilir."));

        if (DateTime.UtcNow > EndDate)
            return Result.Failure(Error.Validation("Contract.EndDate", "Bitiş tarihi geçmiş sözleşmeler aktifleştirilemez."));

        Status = ContractStatus.Active;
        return Result.Success();
    }

    public Result SubmitForApproval()
    {
        if (Status != ContractStatus.Draft)
            return Result.Failure(Error.Conflict("Contract.Status", "Sadece taslak sözleşmeler onaya gönderilebilir."));

        Status = ContractStatus.PendingApproval;
        return Result.Success();
    }

    public Result Suspend(string reason)
    {
        if (Status != ContractStatus.Active)
            return Result.Failure(Error.Conflict("Contract.Status", "Sadece aktif sözleşmeler askıya alınabilir."));

        Status = ContractStatus.Suspended;
        InternalNotes = $"{InternalNotes}\n[{DateTime.UtcNow:yyyy-MM-dd}] Askıya alma nedeni: {reason}";
        return Result.Success();
    }

    public Result Terminate(TerminationType terminationType, string reason)
    {
        if (Status == ContractStatus.Terminated || Status == ContractStatus.Completed)
            return Result.Failure(Error.Conflict("Contract.Status", "Sözleşme zaten sonlandırılmış."));

        Status = ContractStatus.Terminated;
        TerminatedDate = DateTime.UtcNow;
        TerminationType = terminationType;
        TerminationReason = reason;

        return Result.Success();
    }

    public Result<ContractPriceAgreement> AddPriceAgreement(
        Guid productId,
        string productCode,
        string productName,
        Money specialPrice,
        decimal? discountPercentage = null,
        decimal? minimumQuantity = null)
    {
        if (_priceAgreements.Any(p => p.ProductId == productId && p.IsActive))
            return Result<ContractPriceAgreement>.Failure(Error.Conflict("Contract.PriceAgreement", "Bu ürün için zaten bir fiyat anlaşması mevcut."));

        var agreement = ContractPriceAgreement.Create(
            Id, productId, productCode, productName,
            specialPrice, discountPercentage, minimumQuantity);

        if (!agreement.IsSuccess)
            return agreement;

        _priceAgreements.Add(agreement.Value!);
        return agreement;
    }

    public Result<ContractPaymentTerm> AddPaymentTerm(
        PaymentTermType termType,
        int dueDays,
        decimal? discountPercentage = null,
        int? earlyPaymentDiscountDays = null)
    {
        var term = ContractPaymentTerm.Create(Id, termType, dueDays, discountPercentage, earlyPaymentDiscountDays);
        if (!term.IsSuccess)
            return term;

        _paymentTerms.Add(term.Value!);
        return term;
    }

    public Result<ContractCommitment> AddCommitment(
        CommitmentType commitmentType,
        CommitmentPeriod period,
        Money targetAmount,
        decimal? bonusPercentage = null,
        decimal? penaltyPercentage = null)
    {
        var commitment = ContractCommitment.Create(Id, commitmentType, period, targetAmount, bonusPercentage, penaltyPercentage);
        if (!commitment.IsSuccess)
            return commitment;

        _commitments.Add(commitment.Value!);
        return commitment;
    }

    public Result<ContractDocument> AddDocument(string documentName, string documentType, string filePath, string? description = null)
    {
        var document = ContractDocument.Create(Id, documentName, documentType, filePath, description);
        if (!document.IsSuccess)
            return document;

        _documents.Add(document.Value!);
        return document;
    }

    public Result UpdateGeneralDiscount(decimal discountPercentage)
    {
        if (discountPercentage < 0 || discountPercentage > 100)
            return Result.Failure(Error.Validation("Contract.Discount", "İskonto oranı 0-100 arasında olmalıdır."));

        GeneralDiscountPercentage = discountPercentage;
        return Result.Success();
    }

    public Result UpdateCreditLimit(Money creditLimit)
    {
        if (creditLimit.Amount < 0)
            return Result.Failure(Error.Validation("Contract.CreditLimit", "Kredi limiti negatif olamaz."));

        CreditLimit = creditLimit;
        return Result.Success();
    }

    public void SetAutoRenewal(bool autoRenewal, int? renewalPeriodMonths = null, int? noticeBeforeDays = null)
    {
        AutoRenewal = autoRenewal;
        RenewalPeriodMonths = autoRenewal ? (renewalPeriodMonths ?? 12) : null;
        RenewalNoticeBeforeDays = autoRenewal ? (noticeBeforeDays ?? 30) : null;
    }

    public void SetSignatories(string customerSignatory, string customerSignatoryTitle, string companySignatory, string companySignatoryTitle)
    {
        CustomerSignatory = customerSignatory;
        CustomerSignatoryTitle = customerSignatoryTitle;
        CompanySignatory = companySignatory;
        CompanySignatoryTitle = companySignatoryTitle;
    }

    public void AssignSalesRepresentative(Guid salesRepId, string salesRepName)
    {
        SalesRepresentativeId = salesRepId;
        SalesRepresentativeName = salesRepName;
    }

    public bool IsValidAt(DateTime date) => Status == ContractStatus.Active && date >= StartDate && date <= EndDate;
    public int DaysUntilExpiration() => (EndDate - DateTime.UtcNow).Days;
}

public class ContractPriceAgreement : Entity<Guid>
{
    public Guid ContractId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public Money SpecialPrice { get; private set; } = null!;
    public decimal? DiscountPercentage { get; private set; }
    public decimal? MinimumQuantity { get; private set; }
    public bool IsActive { get; private set; }

    private ContractPriceAgreement() { }

    internal static Result<ContractPriceAgreement> Create(
        Guid contractId, Guid productId, string productCode, string productName,
        Money specialPrice, decimal? discountPercentage, decimal? minimumQuantity)
    {
        if (specialPrice.Amount < 0)
            return Result<ContractPriceAgreement>.Failure(Error.Validation("ContractPrice.Amount", "Özel fiyat negatif olamaz."));

        if (discountPercentage.HasValue && (discountPercentage < 0 || discountPercentage > 100))
            return Result<ContractPriceAgreement>.Failure(Error.Validation("ContractPrice.Discount", "İskonto oranı 0-100 arasında olmalıdır."));

        var agreement = new ContractPriceAgreement
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            ProductId = productId,
            ProductCode = productCode,
            ProductName = productName,
            SpecialPrice = specialPrice,
            DiscountPercentage = discountPercentage,
            MinimumQuantity = minimumQuantity,
            IsActive = true
        };

        return Result<ContractPriceAgreement>.Success(agreement);
    }

    public void Deactivate() => IsActive = false;
}

public class ContractPaymentTerm : Entity<Guid>
{
    public Guid ContractId { get; private set; }
    public PaymentTermType TermType { get; private set; }
    public int DueDays { get; private set; }
    public decimal? EarlyPaymentDiscountPercentage { get; private set; }
    public int? EarlyPaymentDiscountDays { get; private set; }
    public bool IsDefault { get; private set; }

    private ContractPaymentTerm() { }

    internal static Result<ContractPaymentTerm> Create(
        Guid contractId, PaymentTermType termType, int dueDays,
        decimal? discountPercentage, int? earlyPaymentDiscountDays)
    {
        if (dueDays < 0)
            return Result<ContractPaymentTerm>.Failure(Error.Validation("ContractPayment.DueDays", "Ödeme vadesi negatif olamaz."));

        var term = new ContractPaymentTerm
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            TermType = termType,
            DueDays = dueDays,
            EarlyPaymentDiscountPercentage = discountPercentage,
            EarlyPaymentDiscountDays = earlyPaymentDiscountDays,
            IsDefault = false
        };

        return Result<ContractPaymentTerm>.Success(term);
    }

    public void SetAsDefault() => IsDefault = true;
}

public class ContractCommitment : Entity<Guid>
{
    public Guid ContractId { get; private set; }
    public CommitmentType CommitmentType { get; private set; }
    public CommitmentPeriod Period { get; private set; }
    public Money TargetAmount { get; private set; } = null!;
    public Money ActualAmount { get; private set; } = null!;
    public decimal? BonusPercentage { get; private set; }
    public decimal? PenaltyPercentage { get; private set; }
    public bool IsAchieved { get; private set; }

    private ContractCommitment() { }

    internal static Result<ContractCommitment> Create(
        Guid contractId, CommitmentType commitmentType, CommitmentPeriod period,
        Money targetAmount, decimal? bonusPercentage, decimal? penaltyPercentage)
    {
        if (targetAmount.Amount <= 0)
            return Result<ContractCommitment>.Failure(Error.Validation("ContractCommitment.Target", "Hedef tutar pozitif olmalıdır."));

        var commitment = new ContractCommitment
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            CommitmentType = commitmentType,
            Period = period,
            TargetAmount = targetAmount,
            ActualAmount = Money.Zero(targetAmount.Currency),
            BonusPercentage = bonusPercentage,
            PenaltyPercentage = penaltyPercentage,
            IsAchieved = false
        };

        return Result<ContractCommitment>.Success(commitment);
    }

    public void UpdateActualAmount(Money amount)
    {
        ActualAmount = amount;
        IsAchieved = amount.Amount >= TargetAmount.Amount;
    }

    public decimal GetAchievementPercentage()
    {
        if (TargetAmount.Amount == 0) return 0;
        return Math.Round(ActualAmount.Amount / TargetAmount.Amount * 100, 2);
    }
}

public class ContractDocument : Entity<Guid>
{
    public Guid ContractId { get; private set; }
    public string DocumentName { get; private set; } = string.Empty;
    public string DocumentType { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime UploadedAt { get; private set; }

    private ContractDocument() { }

    internal static Result<ContractDocument> Create(
        Guid contractId, string documentName, string documentType, string filePath, string? description)
    {
        if (string.IsNullOrWhiteSpace(documentName))
            return Result<ContractDocument>.Failure(Error.Validation("ContractDoc.Name", "Döküman adı boş olamaz."));

        if (string.IsNullOrWhiteSpace(filePath))
            return Result<ContractDocument>.Failure(Error.Validation("ContractDoc.Path", "Dosya yolu boş olamaz."));

        var document = new ContractDocument
        {
            Id = Guid.NewGuid(),
            ContractId = contractId,
            DocumentName = documentName,
            DocumentType = documentType,
            FilePath = filePath,
            Description = description,
            UploadedAt = DateTime.UtcNow
        };

        return Result<ContractDocument>.Success(document);
    }
}

public enum ContractType
{
    AnnualSales = 1,
    FrameworkAgreement = 2,
    Distribution = 3,
    Dealership = 4,
    OneTime = 5,
    ProjectBased = 6,
    Consignment = 7,
    Export = 8
}

public enum ContractStatus
{
    Draft = 1,
    PendingApproval = 2,
    Active = 3,
    Suspended = 4,
    Expired = 5,
    Terminated = 6,
    Completed = 7
}

public enum TerminationType
{
    MutualAgreement = 1,
    CustomerRequest = 2,
    CompanyDecision = 3,
    ContractBreach = 4,
    PaymentIssues = 5,
    ForceMajeure = 6
}

public enum PaymentTermType
{
    Cash = 1,
    Credit = 2,
    Installment = 3,
    PaymentOnDelivery = 4,
    LetterOfCredit = 5,
    Cheque = 6
}

public enum CommitmentType
{
    MinimumPurchaseAmount = 1,
    MinimumPurchaseQuantity = 2,
    TargetSalesAmount = 3,
    TargetSalesQuantity = 4
}

public enum CommitmentPeriod
{
    Monthly = 1,
    Quarterly = 2,
    SemiAnnual = 3,
    Annual = 4,
    ContractPeriod = 5
}
