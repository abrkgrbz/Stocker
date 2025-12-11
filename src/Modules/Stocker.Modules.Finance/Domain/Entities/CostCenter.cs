using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Masraf Merkezi (Cost Center)
/// Maliyet ve gider takibi için organizasyon yapısını yönetir
/// </summary>
public class CostCenter : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Masraf Merkezi Kodu (Cost Center Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Masraf Merkezi Adı (Cost Center Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Masraf Merkezi Türü (Cost Center Type)
    /// </summary>
    public CostCenterType Type { get; private set; }

    /// <summary>
    /// Kategori (Category)
    /// </summary>
    public CostCenterCategory Category { get; private set; }

    #endregion

    #region Hiyerarşi Bilgileri (Hierarchy Information)

    /// <summary>
    /// Üst Masraf Merkezi ID (Parent Cost Center ID)
    /// </summary>
    public int? ParentId { get; private set; }

    /// <summary>
    /// Hiyerarşi Seviyesi (Hierarchy Level)
    /// </summary>
    public int Level { get; private set; }

    /// <summary>
    /// Tam Yol (Full Path)
    /// </summary>
    public string? FullPath { get; private set; }

    /// <summary>
    /// Sıralama (Sort Order)
    /// </summary>
    public int SortOrder { get; private set; }

    #endregion

    #region Sorumluluk Bilgileri (Responsibility Information)

    /// <summary>
    /// Sorumlu Kişi ID (Responsible Person ID)
    /// </summary>
    public int? ResponsibleUserId { get; private set; }

    /// <summary>
    /// Sorumlu Kişi Adı (Responsible Person Name)
    /// </summary>
    public string? ResponsibleUserName { get; private set; }

    /// <summary>
    /// Departman ID (Department ID)
    /// </summary>
    public int? DepartmentId { get; private set; }

    /// <summary>
    /// Şube ID (Branch ID)
    /// </summary>
    public int? BranchId { get; private set; }

    #endregion

    #region Bütçe Bilgileri (Budget Information)

    /// <summary>
    /// Yıllık Bütçe (Annual Budget)
    /// </summary>
    public Money? AnnualBudget { get; private set; }

    /// <summary>
    /// Aylık Bütçe (Monthly Budget)
    /// </summary>
    public Money? MonthlyBudget { get; private set; }

    /// <summary>
    /// Harcanan Tutar (Spent Amount - YTD)
    /// </summary>
    public Money SpentAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan Bütçe (Remaining Budget)
    /// </summary>
    public Money RemainingBudget { get; private set; } = null!;

    /// <summary>
    /// Bütçe Aşım Uyarı Eşiği % (Budget Warning Threshold)
    /// </summary>
    public decimal BudgetWarningThreshold { get; private set; } = 80;

    /// <summary>
    /// Bütçe Aşımına İzin Ver (Allow Budget Overrun)
    /// </summary>
    public bool AllowBudgetOverrun { get; private set; }

    /// <summary>
    /// Bütçe Aşım Onayı Gerekli (Require Approval for Overrun)
    /// </summary>
    public bool RequireApprovalForOverrun { get; private set; } = true;

    #endregion

    #region Dağıtım Bilgileri (Allocation Information)

    /// <summary>
    /// Dağıtım Anahtarı (Allocation Key)
    /// </summary>
    public string? AllocationKey { get; private set; }

    /// <summary>
    /// Dağıtım Oranı % (Allocation Rate)
    /// </summary>
    public decimal? AllocationRate { get; private set; }

    /// <summary>
    /// Otomatik Dağıtım Aktif mi? (Is Auto Allocation Enabled)
    /// </summary>
    public bool IsAutoAllocationEnabled { get; private set; }

    /// <summary>
    /// Dağıtım Periyodu (Allocation Period)
    /// </summary>
    public AllocationPeriod? AllocationPeriod { get; private set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    /// <summary>
    /// Muhasebe Hesabı ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; private set; }

    /// <summary>
    /// Muhasebe Hesap Kodu (Accounting Account Code)
    /// </summary>
    public string? AccountingAccountCode { get; private set; }

    /// <summary>
    /// Varsayılan Gider Hesabı ID (Default Expense Account ID)
    /// </summary>
    public int? DefaultExpenseAccountId { get; private set; }

    #endregion

    #region İstatistik ve Analiz (Statistics and Analysis)

    /// <summary>
    /// Toplam İşlem Sayısı (Total Transaction Count)
    /// </summary>
    public int TotalTransactionCount { get; private set; }

    /// <summary>
    /// Aylık Ortalama Harcama (Monthly Average Spending)
    /// </summary>
    public Money? MonthlyAverageSpending { get; private set; }

    /// <summary>
    /// Son İşlem Tarihi (Last Transaction Date)
    /// </summary>
    public DateTime? LastTransactionDate { get; private set; }

    /// <summary>
    /// Son Bütçe Güncelleme Tarihi (Last Budget Update Date)
    /// </summary>
    public DateTime? LastBudgetUpdateDate { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Varsayılan mı? (Is Default)
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Donduruldu mu? (Is Frozen)
    /// </summary>
    public bool IsFrozen { get; private set; }

    /// <summary>
    /// Başlangıç Tarihi (Start Date)
    /// </summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>
    /// Bitiş Tarihi (End Date)
    /// </summary>
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual CostCenter? Parent { get; private set; }
    public virtual ICollection<CostCenter> Children { get; private set; } = new List<CostCenter>();
    public virtual Account? AccountingAccount { get; private set; }
    public virtual Account? DefaultExpenseAccount { get; private set; }
    public virtual ICollection<Expense> Expenses { get; private set; } = new List<Expense>();
    public virtual ICollection<JournalEntry> JournalEntries { get; private set; } = new List<JournalEntry>();
    public virtual ICollection<BudgetItem> BudgetItems { get; private set; } = new List<BudgetItem>();

    #endregion

    protected CostCenter() { }

    public CostCenter(
        string code,
        string name,
        CostCenterType type,
        CostCenterCategory category,
        string currency = "TRY")
    {
        Code = code;
        Name = name;
        Type = type;
        Category = category;
        Level = 0;
        SpentAmount = Money.Zero(currency);
        RemainingBudget = Money.Zero(currency);
        IsActive = true;
        IsDefault = false;
        IsFrozen = false;
        AllowBudgetOverrun = false;
        RequireApprovalForOverrun = true;
        IsAutoAllocationEnabled = false;
        TotalTransactionCount = 0;
    }

    public void UpdateBasicInfo(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetParent(int? parentId, int level, string? fullPath)
    {
        ParentId = parentId;
        Level = level;
        FullPath = fullPath;
    }

    public void SetSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
    }

    public void SetResponsible(int userId, string userName)
    {
        ResponsibleUserId = userId;
        ResponsibleUserName = userName;
    }

    public void SetDepartment(int departmentId)
    {
        DepartmentId = departmentId;
    }

    public void SetBranch(int branchId)
    {
        BranchId = branchId;
    }

    public void SetAnnualBudget(Money budget)
    {
        AnnualBudget = budget;
        MonthlyBudget = Money.Create(budget.Amount / 12, budget.Currency);
        RecalculateRemainingBudget();
        LastBudgetUpdateDate = DateTime.UtcNow;
    }

    public void SetMonthlyBudget(Money budget)
    {
        MonthlyBudget = budget;
        AnnualBudget = Money.Create(budget.Amount * 12, budget.Currency);
        RecalculateRemainingBudget();
        LastBudgetUpdateDate = DateTime.UtcNow;
    }

    public void SetBudgetWarningThreshold(decimal threshold)
    {
        if (threshold < 0 || threshold > 100)
            throw new ArgumentOutOfRangeException(nameof(threshold), "Threshold must be between 0 and 100");

        BudgetWarningThreshold = threshold;
    }

    public void SetBudgetOverrunPolicy(bool allowOverrun, bool requireApproval = true)
    {
        AllowBudgetOverrun = allowOverrun;
        RequireApprovalForOverrun = requireApproval;
    }

    public void SetAllocation(string? allocationKey, decimal? rate, bool autoEnabled = false, AllocationPeriod? period = null)
    {
        AllocationKey = allocationKey;
        AllocationRate = rate;
        IsAutoAllocationEnabled = autoEnabled;
        AllocationPeriod = period;
    }

    public void LinkToAccountingAccount(int accountId, string accountCode)
    {
        AccountingAccountId = accountId;
        AccountingAccountCode = accountCode;
    }

    public void SetDefaultExpenseAccount(int accountId)
    {
        DefaultExpenseAccountId = accountId;
    }

    public void AddSpending(Money amount)
    {
        if (amount.Currency != SpentAmount.Currency)
            throw new InvalidOperationException("Currency mismatch");

        SpentAmount = Money.Create(SpentAmount.Amount + amount.Amount, SpentAmount.Currency);
        TotalTransactionCount++;
        LastTransactionDate = DateTime.UtcNow;
        RecalculateRemainingBudget();
        UpdateMonthlyAverage();
    }

    public void ReverseSpending(Money amount)
    {
        if (amount.Currency != SpentAmount.Currency)
            throw new InvalidOperationException("Currency mismatch");

        SpentAmount = Money.Create(SpentAmount.Amount - amount.Amount, SpentAmount.Currency);
        RecalculateRemainingBudget();
        UpdateMonthlyAverage();
    }

    private void RecalculateRemainingBudget()
    {
        if (AnnualBudget != null)
        {
            RemainingBudget = Money.Create(AnnualBudget.Amount - SpentAmount.Amount, AnnualBudget.Currency);
        }
    }

    private void UpdateMonthlyAverage()
    {
        if (TotalTransactionCount > 0 && StartDate.HasValue)
        {
            var months = Math.Max(1, (DateTime.UtcNow - StartDate.Value).Days / 30);
            MonthlyAverageSpending = Money.Create(SpentAmount.Amount / months, SpentAmount.Currency);
        }
    }

    public bool IsBudgetWarning()
    {
        if (AnnualBudget == null || AnnualBudget.Amount == 0)
            return false;

        var usagePercentage = (SpentAmount.Amount / AnnualBudget.Amount) * 100;
        return usagePercentage >= BudgetWarningThreshold;
    }

    public bool IsOverBudget()
    {
        if (AnnualBudget == null)
            return false;

        return SpentAmount.Amount > AnnualBudget.Amount;
    }

    public decimal GetBudgetUsagePercentage()
    {
        if (AnnualBudget == null || AnnualBudget.Amount == 0)
            return 0;

        return (SpentAmount.Amount / AnnualBudget.Amount) * 100;
    }

    public bool CanSpend(Money amount)
    {
        if (IsFrozen)
            return false;

        if (!IsActive)
            return false;

        if (AllowBudgetOverrun)
            return true;

        if (AnnualBudget == null)
            return true;

        return (SpentAmount.Amount + amount.Amount) <= AnnualBudget.Amount;
    }

    public void SetDates(DateTime? startDate, DateTime? endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void RemoveDefault()
    {
        IsDefault = false;
    }

    public void Freeze(string? reason = null)
    {
        IsFrozen = true;
        if (!string.IsNullOrEmpty(reason))
        {
            Notes = string.IsNullOrEmpty(Notes) ? $"Frozen: {reason}" : $"{Notes}\nFrozen: {reason}";
        }
    }

    public void Unfreeze()
    {
        IsFrozen = false;
    }

    public void ResetYearlySpending()
    {
        SpentAmount = Money.Zero(SpentAmount.Currency);
        TotalTransactionCount = 0;
        MonthlyAverageSpending = null;
        RecalculateRemainingBudget();
    }

    #region Factory Methods

    /// <summary>
    /// Departman masraf merkezi oluştur (Create department cost center)
    /// </summary>
    public static CostCenter CreateDepartmentCenter(
        string code,
        string name,
        int departmentId,
        Money? annualBudget = null)
    {
        var center = new CostCenter(
            code,
            name,
            CostCenterType.Department,
            CostCenterCategory.Administrative);

        center.SetDepartment(departmentId);
        if (annualBudget != null)
            center.SetAnnualBudget(annualBudget);

        return center;
    }

    /// <summary>
    /// Proje masraf merkezi oluştur (Create project cost center)
    /// </summary>
    public static CostCenter CreateProjectCenter(
        string code,
        string name,
        Money budget,
        DateTime startDate,
        DateTime? endDate = null)
    {
        var center = new CostCenter(
            code,
            name,
            CostCenterType.Project,
            CostCenterCategory.Production);

        center.SetAnnualBudget(budget);
        center.SetDates(startDate, endDate);
        center.SetBudgetOverrunPolicy(false, true);

        return center;
    }

    /// <summary>
    /// Şube masraf merkezi oluştur (Create branch cost center)
    /// </summary>
    public static CostCenter CreateBranchCenter(
        string code,
        string name,
        int branchId,
        Money? annualBudget = null)
    {
        var center = new CostCenter(
            code,
            name,
            CostCenterType.Branch,
            CostCenterCategory.Distribution);

        center.SetBranch(branchId);
        if (annualBudget != null)
            center.SetAnnualBudget(annualBudget);

        return center;
    }

    /// <summary>
    /// Üretim masraf merkezi oluştur (Create production cost center)
    /// </summary>
    public static CostCenter CreateProductionCenter(
        string code,
        string name,
        Money? annualBudget = null)
    {
        var center = new CostCenter(
            code,
            name,
            CostCenterType.Production,
            CostCenterCategory.Production);

        if (annualBudget != null)
            center.SetAnnualBudget(annualBudget);

        return center;
    }

    #endregion
}

/// <summary>
/// Masraf Merkezi Türleri (Cost Center Types)
/// </summary>
public enum CostCenterType
{
    /// <summary>
    /// Ana Merkez (Main Center)
    /// </summary>
    Main = 1,

    /// <summary>
    /// Departman (Department)
    /// </summary>
    Department = 2,

    /// <summary>
    /// Şube (Branch)
    /// </summary>
    Branch = 3,

    /// <summary>
    /// Proje (Project)
    /// </summary>
    Project = 4,

    /// <summary>
    /// Üretim (Production)
    /// </summary>
    Production = 5,

    /// <summary>
    /// Hizmet (Service)
    /// </summary>
    Service = 6,

    /// <summary>
    /// Yardımcı (Auxiliary)
    /// </summary>
    Auxiliary = 7,

    /// <summary>
    /// Geçici (Temporary)
    /// </summary>
    Temporary = 8
}

/// <summary>
/// Masraf Merkezi Kategorileri (Cost Center Categories)
/// </summary>
public enum CostCenterCategory
{
    /// <summary>
    /// Üretim (Production)
    /// </summary>
    Production = 1,

    /// <summary>
    /// Yönetim (Administrative)
    /// </summary>
    Administrative = 2,

    /// <summary>
    /// Satış (Sales)
    /// </summary>
    Sales = 3,

    /// <summary>
    /// Pazarlama (Marketing)
    /// </summary>
    Marketing = 4,

    /// <summary>
    /// Dağıtım (Distribution)
    /// </summary>
    Distribution = 5,

    /// <summary>
    /// Ar-Ge (R&D)
    /// </summary>
    RnD = 6,

    /// <summary>
    /// Destek (Support)
    /// </summary>
    Support = 7,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}

/// <summary>
/// Dağıtım Periyotları (Allocation Periods)
/// </summary>
public enum AllocationPeriod
{
    /// <summary>
    /// Günlük (Daily)
    /// </summary>
    Daily = 1,

    /// <summary>
    /// Haftalık (Weekly)
    /// </summary>
    Weekly = 2,

    /// <summary>
    /// Aylık (Monthly)
    /// </summary>
    Monthly = 3,

    /// <summary>
    /// Üç Aylık (Quarterly)
    /// </summary>
    Quarterly = 4,

    /// <summary>
    /// Yıllık (Annually)
    /// </summary>
    Annually = 5
}
