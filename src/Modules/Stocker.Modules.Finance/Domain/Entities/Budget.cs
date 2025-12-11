using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Bütçe (Budget)
/// Yıllık ve dönemsel bütçe yönetimi
/// </summary>
public class Budget : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Bütçe Kodu (Budget Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Bütçe Adı (Budget Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Bütçe Türü (Budget Type)
    /// </summary>
    public BudgetType Type { get; private set; }

    /// <summary>
    /// Bütçe Kategorisi (Budget Category)
    /// </summary>
    public BudgetCategory Category { get; private set; }

    #endregion

    #region Dönem Bilgileri (Period Information)

    /// <summary>
    /// Mali Yıl (Fiscal Year)
    /// </summary>
    public int FiscalYear { get; private set; }

    /// <summary>
    /// Başlangıç Tarihi (Start Date)
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş Tarihi (End Date)
    /// </summary>
    public DateTime EndDate { get; private set; }

    /// <summary>
    /// Dönem Türü (Period Type)
    /// </summary>
    public BudgetPeriodType PeriodType { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Toplam Bütçe (Total Budget)
    /// </summary>
    public Money TotalBudget { get; private set; } = null!;

    /// <summary>
    /// Kullanılan Tutar (Used Amount)
    /// </summary>
    public Money UsedAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan Tutar (Remaining Amount)
    /// </summary>
    public Money RemainingAmount { get; private set; } = null!;

    /// <summary>
    /// Taahhüt Edilen Tutar (Committed Amount)
    /// </summary>
    public Money CommittedAmount { get; private set; } = null!;

    /// <summary>
    /// Kullanılabilir Tutar (Available Amount = Remaining - Committed)
    /// </summary>
    public Money AvailableAmount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Revize Edilen Bütçe (Revised Budget)
    /// </summary>
    public Money? RevisedBudget { get; private set; }

    /// <summary>
    /// Orijinal Bütçe (Original Budget)
    /// </summary>
    public Money OriginalBudget { get; private set; } = null!;

    #endregion

    #region Kontrol Bilgileri (Control Information)

    /// <summary>
    /// Bütçe Aşımına İzin Ver (Allow Overrun)
    /// </summary>
    public bool AllowOverrun { get; private set; }

    /// <summary>
    /// Aşım için Onay Gerekli (Require Approval for Overrun)
    /// </summary>
    public bool RequireApprovalForOverrun { get; private set; } = true;

    /// <summary>
    /// Uyarı Eşiği % (Warning Threshold)
    /// </summary>
    public decimal WarningThreshold { get; private set; } = 80;

    /// <summary>
    /// Kritik Eşik % (Critical Threshold)
    /// </summary>
    public decimal CriticalThreshold { get; private set; } = 95;

    /// <summary>
    /// Transfer İzni (Allow Transfer)
    /// </summary>
    public bool AllowTransfer { get; private set; }

    /// <summary>
    /// Maksimum Transfer Oranı % (Maximum Transfer Rate)
    /// </summary>
    public decimal? MaxTransferRate { get; private set; }

    #endregion

    #region İlişki Bilgileri (Relationship Information)

    /// <summary>
    /// Üst Bütçe ID (Parent Budget ID)
    /// </summary>
    public int? ParentBudgetId { get; private set; }

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    /// <summary>
    /// Departman ID (Department ID)
    /// </summary>
    public int? DepartmentId { get; private set; }

    /// <summary>
    /// Proje ID (Project ID)
    /// </summary>
    public int? ProjectId { get; private set; }

    /// <summary>
    /// Muhasebe Hesabı ID (Account ID)
    /// </summary>
    public int? AccountId { get; private set; }

    /// <summary>
    /// Hesap Kodu (Account Code)
    /// </summary>
    public string? AccountCode { get; private set; }

    #endregion

    #region Sorumluluk Bilgileri (Responsibility Information)

    /// <summary>
    /// Bütçe Sahibi ID (Budget Owner User ID)
    /// </summary>
    public int? OwnerUserId { get; private set; }

    /// <summary>
    /// Bütçe Sahibi Adı (Budget Owner Name)
    /// </summary>
    public string? OwnerUserName { get; private set; }

    /// <summary>
    /// Onaylayan ID (Approver User ID)
    /// </summary>
    public int? ApproverUserId { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public BudgetStatus Status { get; private set; }

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Kilitli mi? (Is Locked)
    /// </summary>
    public bool IsLocked { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Revizyon Sayısı (Revision Count)
    /// </summary>
    public int RevisionCount { get; private set; }

    /// <summary>
    /// Son Revizyon Tarihi (Last Revision Date)
    /// </summary>
    public DateTime? LastRevisionDate { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual Budget? ParentBudget { get; private set; }
    public virtual ICollection<Budget> ChildBudgets { get; private set; } = new List<Budget>();
    public virtual CostCenter? CostCenter { get; private set; }
    public virtual Account? Account { get; private set; }
    public virtual ICollection<BudgetItem> Items { get; private set; } = new List<BudgetItem>();
    public virtual ICollection<BudgetTransfer> TransfersOut { get; private set; } = new List<BudgetTransfer>();
    public virtual ICollection<BudgetTransfer> TransfersIn { get; private set; } = new List<BudgetTransfer>();

    #endregion

    protected Budget() { }

    public Budget(
        string code,
        string name,
        BudgetType type,
        BudgetCategory category,
        int fiscalYear,
        DateTime startDate,
        DateTime endDate,
        Money totalBudget,
        BudgetPeriodType periodType = BudgetPeriodType.Annual)
    {
        Code = code;
        Name = name;
        Type = type;
        Category = category;
        FiscalYear = fiscalYear;
        StartDate = startDate;
        EndDate = endDate;
        PeriodType = periodType;

        Currency = totalBudget.Currency;
        TotalBudget = totalBudget;
        OriginalBudget = totalBudget;
        UsedAmount = Money.Zero(Currency);
        CommittedAmount = Money.Zero(Currency);
        RemainingAmount = totalBudget;
        AvailableAmount = totalBudget;

        AllowOverrun = false;
        RequireApprovalForOverrun = true;
        AllowTransfer = true;
        Status = BudgetStatus.Draft;
        IsActive = false;
        IsLocked = false;
        RevisionCount = 0;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetThresholds(decimal warningThreshold, decimal criticalThreshold)
    {
        if (warningThreshold >= criticalThreshold)
            throw new ArgumentException("Warning threshold must be less than critical threshold");

        WarningThreshold = warningThreshold;
        CriticalThreshold = criticalThreshold;
    }

    public void SetOverrunPolicy(bool allowOverrun, bool requireApproval = true)
    {
        AllowOverrun = allowOverrun;
        RequireApprovalForOverrun = requireApproval;
    }

    public void SetTransferPolicy(bool allowTransfer, decimal? maxTransferRate = null)
    {
        AllowTransfer = allowTransfer;
        MaxTransferRate = maxTransferRate;
    }

    public void LinkToParentBudget(int parentBudgetId)
    {
        ParentBudgetId = parentBudgetId;
    }

    public void LinkToCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void LinkToDepartment(int departmentId)
    {
        DepartmentId = departmentId;
    }

    public void LinkToProject(int projectId)
    {
        ProjectId = projectId;
    }

    public void LinkToAccount(int accountId, string accountCode)
    {
        AccountId = accountId;
        AccountCode = accountCode;
    }

    public void SetOwner(int userId, string userName)
    {
        OwnerUserId = userId;
        OwnerUserName = userName;
    }

    public void SetApprover(int userId)
    {
        ApproverUserId = userId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    #region Budget Operations

    /// <summary>
    /// Harcama ekle (Add spending)
    /// </summary>
    public void AddSpending(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        if (!AllowOverrun && (UsedAmount.Amount + amount.Amount) > TotalBudget.Amount)
            throw new InvalidOperationException("Budget would be exceeded");

        UsedAmount = Money.Create(UsedAmount.Amount + amount.Amount, Currency);
        RecalculateAmounts();
    }

    /// <summary>
    /// Harcama düşür (Reverse spending)
    /// </summary>
    public void ReverseSpending(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        UsedAmount = Money.Create(UsedAmount.Amount - amount.Amount, Currency);
        RecalculateAmounts();
    }

    /// <summary>
    /// Taahhüt ekle (Add commitment)
    /// </summary>
    public void AddCommitment(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        CommittedAmount = Money.Create(CommittedAmount.Amount + amount.Amount, Currency);
        RecalculateAmounts();
    }

    /// <summary>
    /// Taahhüt düşür (Release commitment)
    /// </summary>
    public void ReleaseCommitment(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        CommittedAmount = Money.Create(CommittedAmount.Amount - amount.Amount, Currency);
        RecalculateAmounts();
    }

    /// <summary>
    /// Taahhüdü harcamaya dönüştür (Convert commitment to spending)
    /// </summary>
    public void ConvertCommitmentToSpending(Money amount)
    {
        ReleaseCommitment(amount);
        AddSpending(amount);
    }

    private void RecalculateAmounts()
    {
        var budget = RevisedBudget ?? TotalBudget;
        RemainingAmount = Money.Create(budget.Amount - UsedAmount.Amount, Currency);
        AvailableAmount = Money.Create(RemainingAmount.Amount - CommittedAmount.Amount, Currency);
    }

    /// <summary>
    /// Bütçeyi revize et (Revise budget)
    /// </summary>
    public void Revise(Money newBudget, string? reason = null)
    {
        if (IsLocked)
            throw new InvalidOperationException("Budget is locked and cannot be revised");

        RevisedBudget = newBudget;
        TotalBudget = newBudget;
        RevisionCount++;
        LastRevisionDate = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(reason))
        {
            Notes = string.IsNullOrEmpty(Notes)
                ? $"Revision {RevisionCount}: {reason}"
                : $"{Notes}\nRevision {RevisionCount}: {reason}";
        }

        RecalculateAmounts();
    }

    #endregion

    #region Status Management

    public void Submit()
    {
        if (Status != BudgetStatus.Draft)
            throw new InvalidOperationException("Only draft budgets can be submitted");

        Status = BudgetStatus.PendingApproval;
    }

    public void Approve(int approverUserId)
    {
        if (Status != BudgetStatus.PendingApproval)
            throw new InvalidOperationException("Only pending budgets can be approved");

        Status = BudgetStatus.Approved;
        ApproverUserId = approverUserId;
        ApprovalDate = DateTime.UtcNow;
        IsActive = true;
    }

    public void Reject(string reason)
    {
        if (Status != BudgetStatus.PendingApproval)
            throw new InvalidOperationException("Only pending budgets can be rejected");

        Status = BudgetStatus.Rejected;
        Notes = string.IsNullOrEmpty(Notes) ? $"Rejected: {reason}" : $"{Notes}\nRejected: {reason}";
    }

    public void Activate()
    {
        if (Status != BudgetStatus.Approved)
            throw new InvalidOperationException("Only approved budgets can be activated");

        IsActive = true;
        Status = BudgetStatus.Active;
    }

    public void Deactivate()
    {
        IsActive = false;
        Status = BudgetStatus.Inactive;
    }

    public void Lock()
    {
        IsLocked = true;
    }

    public void Unlock()
    {
        IsLocked = false;
    }

    public void Close()
    {
        Status = BudgetStatus.Closed;
        IsActive = false;
        IsLocked = true;
    }

    #endregion

    #region Analysis Methods

    public decimal GetUsagePercentage()
    {
        if (TotalBudget.Amount == 0)
            return 0;

        return (UsedAmount.Amount / TotalBudget.Amount) * 100;
    }

    public decimal GetCommitmentPercentage()
    {
        if (TotalBudget.Amount == 0)
            return 0;

        return (CommittedAmount.Amount / TotalBudget.Amount) * 100;
    }

    public decimal GetTotalAllocationPercentage()
    {
        if (TotalBudget.Amount == 0)
            return 0;

        return ((UsedAmount.Amount + CommittedAmount.Amount) / TotalBudget.Amount) * 100;
    }

    public bool IsAtWarningLevel()
    {
        return GetUsagePercentage() >= WarningThreshold;
    }

    public bool IsAtCriticalLevel()
    {
        return GetUsagePercentage() >= CriticalThreshold;
    }

    public bool IsOverBudget()
    {
        return UsedAmount.Amount > TotalBudget.Amount;
    }

    public bool CanSpend(Money amount)
    {
        if (!IsActive)
            return false;

        if (IsLocked)
            return false;

        if (AllowOverrun)
            return true;

        return (UsedAmount.Amount + amount.Amount) <= TotalBudget.Amount;
    }

    public BudgetHealthStatus GetHealthStatus()
    {
        var usagePercentage = GetUsagePercentage();

        if (usagePercentage >= 100)
            return BudgetHealthStatus.Exceeded;
        if (usagePercentage >= CriticalThreshold)
            return BudgetHealthStatus.Critical;
        if (usagePercentage >= WarningThreshold)
            return BudgetHealthStatus.Warning;

        return BudgetHealthStatus.Healthy;
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Yıllık departman bütçesi oluştur (Create annual department budget)
    /// </summary>
    public static Budget CreateDepartmentBudget(
        string code,
        string name,
        int fiscalYear,
        Money totalBudget,
        int departmentId)
    {
        var budget = new Budget(
            code,
            name,
            BudgetType.Department,
            BudgetCategory.Operating,
            fiscalYear,
            new DateTime(fiscalYear, 1, 1),
            new DateTime(fiscalYear, 12, 31),
            totalBudget);

        budget.LinkToDepartment(departmentId);

        return budget;
    }

    /// <summary>
    /// Proje bütçesi oluştur (Create project budget)
    /// </summary>
    public static Budget CreateProjectBudget(
        string code,
        string name,
        DateTime startDate,
        DateTime endDate,
        Money totalBudget,
        int projectId)
    {
        var budget = new Budget(
            code,
            name,
            BudgetType.Project,
            BudgetCategory.Capital,
            startDate.Year,
            startDate,
            endDate,
            totalBudget,
            BudgetPeriodType.Custom);

        budget.LinkToProject(projectId);
        budget.SetOverrunPolicy(false, true);

        return budget;
    }

    /// <summary>
    /// Masraf merkezi bütçesi oluştur (Create cost center budget)
    /// </summary>
    public static Budget CreateCostCenterBudget(
        string code,
        string name,
        int fiscalYear,
        Money totalBudget,
        int costCenterId)
    {
        var budget = new Budget(
            code,
            name,
            BudgetType.CostCenter,
            BudgetCategory.Operating,
            fiscalYear,
            new DateTime(fiscalYear, 1, 1),
            new DateTime(fiscalYear, 12, 31),
            totalBudget);

        budget.LinkToCostCenter(costCenterId);

        return budget;
    }

    #endregion
}

/// <summary>
/// Bütçe Kalemi (Budget Item)
/// </summary>
public class BudgetItem : BaseEntity
{
    /// <summary>
    /// Bütçe ID (Budget ID)
    /// </summary>
    public int BudgetId { get; private set; }

    /// <summary>
    /// Kalem Kodu (Item Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Kalem Adı (Item Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Hesap ID (Account ID)
    /// </summary>
    public int? AccountId { get; private set; }

    /// <summary>
    /// Hesap Kodu (Account Code)
    /// </summary>
    public string? AccountCode { get; private set; }

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    /// <summary>
    /// Bütçe Tutarı (Budget Amount)
    /// </summary>
    public Money BudgetAmount { get; private set; } = null!;

    /// <summary>
    /// Kullanılan Tutar (Used Amount)
    /// </summary>
    public Money UsedAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan Tutar (Remaining Amount)
    /// </summary>
    public Money RemainingAmount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    public virtual Budget Budget { get; private set; } = null!;
    public virtual Account? Account { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }

    protected BudgetItem() { }

    public BudgetItem(
        int budgetId,
        string code,
        string name,
        Money budgetAmount)
    {
        BudgetId = budgetId;
        Code = code;
        Name = name;
        Currency = budgetAmount.Currency;
        BudgetAmount = budgetAmount;
        UsedAmount = Money.Zero(Currency);
        RemainingAmount = budgetAmount;
        IsActive = true;
    }

    public void LinkToAccount(int accountId, string accountCode)
    {
        AccountId = accountId;
        AccountCode = accountCode;
    }

    public void LinkToCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void AddSpending(Money amount)
    {
        UsedAmount = Money.Create(UsedAmount.Amount + amount.Amount, Currency);
        RemainingAmount = Money.Create(BudgetAmount.Amount - UsedAmount.Amount, Currency);
    }

    public void ReverseSpending(Money amount)
    {
        UsedAmount = Money.Create(UsedAmount.Amount - amount.Amount, Currency);
        RemainingAmount = Money.Create(BudgetAmount.Amount - UsedAmount.Amount, Currency);
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }
}

/// <summary>
/// Bütçe Transferi (Budget Transfer)
/// </summary>
public class BudgetTransfer : BaseEntity
{
    /// <summary>
    /// Transfer Numarası (Transfer Number)
    /// </summary>
    public string TransferNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Kaynak Bütçe ID (Source Budget ID)
    /// </summary>
    public int SourceBudgetId { get; private set; }

    /// <summary>
    /// Hedef Bütçe ID (Target Budget ID)
    /// </summary>
    public int TargetBudgetId { get; private set; }

    /// <summary>
    /// Transfer Tutarı (Transfer Amount)
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Transfer Tarihi (Transfer Date)
    /// </summary>
    public DateTime TransferDate { get; private set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public BudgetTransferStatus Status { get; private set; }

    /// <summary>
    /// Talep Eden ID (Requested By User ID)
    /// </summary>
    public int RequestedByUserId { get; private set; }

    /// <summary>
    /// Onaylayan ID (Approved By User ID)
    /// </summary>
    public int? ApprovedByUserId { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    public virtual Budget SourceBudget { get; private set; } = null!;
    public virtual Budget TargetBudget { get; private set; } = null!;

    protected BudgetTransfer() { }

    public BudgetTransfer(
        string transferNumber,
        int sourceBudgetId,
        int targetBudgetId,
        Money amount,
        int requestedByUserId,
        string? description = null)
    {
        TransferNumber = transferNumber;
        SourceBudgetId = sourceBudgetId;
        TargetBudgetId = targetBudgetId;
        Amount = amount;
        TransferDate = DateTime.UtcNow;
        Description = description;
        RequestedByUserId = requestedByUserId;
        Status = BudgetTransferStatus.Pending;
    }

    public void Approve(int approvedByUserId)
    {
        Status = BudgetTransferStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        ApprovalDate = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        Status = BudgetTransferStatus.Rejected;
        Description = string.IsNullOrEmpty(Description)
            ? $"Rejected: {reason}"
            : $"{Description}\nRejected: {reason}";
    }

    public void Complete()
    {
        Status = BudgetTransferStatus.Completed;
    }

    public void Cancel()
    {
        Status = BudgetTransferStatus.Cancelled;
    }
}

#region Enums

/// <summary>
/// Bütçe Türleri (Budget Types)
/// </summary>
public enum BudgetType
{
    /// <summary>
    /// Kurumsal (Corporate)
    /// </summary>
    Corporate = 1,

    /// <summary>
    /// Departman (Department)
    /// </summary>
    Department = 2,

    /// <summary>
    /// Masraf Merkezi (Cost Center)
    /// </summary>
    CostCenter = 3,

    /// <summary>
    /// Proje (Project)
    /// </summary>
    Project = 4,

    /// <summary>
    /// Hesap (Account)
    /// </summary>
    Account = 5,

    /// <summary>
    /// Kalem (Line Item)
    /// </summary>
    LineItem = 6
}

/// <summary>
/// Bütçe Kategorileri (Budget Categories)
/// </summary>
public enum BudgetCategory
{
    /// <summary>
    /// Operasyonel (Operating)
    /// </summary>
    Operating = 1,

    /// <summary>
    /// Yatırım (Capital)
    /// </summary>
    Capital = 2,

    /// <summary>
    /// Gelir (Revenue)
    /// </summary>
    Revenue = 3,

    /// <summary>
    /// Gider (Expense)
    /// </summary>
    Expense = 4,

    /// <summary>
    /// Karma (Mixed)
    /// </summary>
    Mixed = 5
}

/// <summary>
/// Bütçe Dönem Türleri (Budget Period Types)
/// </summary>
public enum BudgetPeriodType
{
    /// <summary>
    /// Aylık (Monthly)
    /// </summary>
    Monthly = 1,

    /// <summary>
    /// Üç Aylık (Quarterly)
    /// </summary>
    Quarterly = 2,

    /// <summary>
    /// Yıllık (Annual)
    /// </summary>
    Annual = 3,

    /// <summary>
    /// Özel (Custom)
    /// </summary>
    Custom = 99
}

/// <summary>
/// Bütçe Durumları (Budget Statuses)
/// </summary>
public enum BudgetStatus
{
    /// <summary>
    /// Taslak (Draft)
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Onay Bekliyor (Pending Approval)
    /// </summary>
    PendingApproval = 2,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 3,

    /// <summary>
    /// Aktif (Active)
    /// </summary>
    Active = 4,

    /// <summary>
    /// Pasif (Inactive)
    /// </summary>
    Inactive = 5,

    /// <summary>
    /// Reddedildi (Rejected)
    /// </summary>
    Rejected = 6,

    /// <summary>
    /// Kapatıldı (Closed)
    /// </summary>
    Closed = 7
}

/// <summary>
/// Bütçe Sağlık Durumu (Budget Health Status)
/// </summary>
public enum BudgetHealthStatus
{
    /// <summary>
    /// Sağlıklı (Healthy)
    /// </summary>
    Healthy = 1,

    /// <summary>
    /// Uyarı (Warning)
    /// </summary>
    Warning = 2,

    /// <summary>
    /// Kritik (Critical)
    /// </summary>
    Critical = 3,

    /// <summary>
    /// Aşıldı (Exceeded)
    /// </summary>
    Exceeded = 4
}

/// <summary>
/// Bütçe Transfer Durumları (Budget Transfer Statuses)
/// </summary>
public enum BudgetTransferStatus
{
    /// <summary>
    /// Beklemede (Pending)
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Reddedildi (Rejected)
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Tamamlandı (Completed)
    /// </summary>
    Completed = 4,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 5
}

#endregion
