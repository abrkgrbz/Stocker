using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// İşe alım süreci entity'si - Onboarding checklist ve takip
/// Onboarding entity - Onboarding checklist and tracking
/// </summary>
public class Onboarding : BaseEntity
{
    private readonly List<OnboardingTask> _tasks = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public OnboardingStatus Status { get; private set; }

    /// <summary>
    /// Şablon ID / Template ID
    /// </summary>
    public int? TemplateId { get; private set; }

    #endregion

    #region Tarihler (Dates)

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Planlanan bitiş tarihi / Planned end date
    /// </summary>
    public DateTime? PlannedEndDate { get; private set; }

    /// <summary>
    /// Gerçek bitiş tarihi / Actual end date
    /// </summary>
    public DateTime? ActualEndDate { get; private set; }

    /// <summary>
    /// İlk iş günü / First day at work
    /// </summary>
    public DateTime FirstDayOfWork { get; private set; }

    #endregion

    #region Atamalar (Assignments)

    /// <summary>
    /// Buddy/Mentor ID / Buddy ID
    /// </summary>
    public int? BuddyId { get; private set; }

    /// <summary>
    /// HR sorumlusu ID / HR responsible ID
    /// </summary>
    public int? HrResponsibleId { get; private set; }

    /// <summary>
    /// IT sorumlusu ID / IT responsible ID
    /// </summary>
    public int? ItResponsibleId { get; private set; }

    #endregion

    #region İlerleme (Progress)

    /// <summary>
    /// Tamamlanma yüzdesi / Completion percentage
    /// </summary>
    public decimal CompletionPercentage { get; private set; }

    /// <summary>
    /// Toplam görev sayısı / Total tasks
    /// </summary>
    public int TotalTasks { get; private set; }

    /// <summary>
    /// Tamamlanan görev sayısı / Completed tasks
    /// </summary>
    public int CompletedTasks { get; private set; }

    #endregion

    #region Ekipman (Equipment)

    /// <summary>
    /// Laptop verildi mi? / Laptop provided?
    /// </summary>
    public bool LaptopProvided { get; private set; }

    /// <summary>
    /// Telefon verildi mi? / Phone provided?
    /// </summary>
    public bool PhoneProvided { get; private set; }

    /// <summary>
    /// Kartlı giriş verildi mi? / Access card provided?
    /// </summary>
    public bool AccessCardProvided { get; private set; }

    /// <summary>
    /// Ekipman notları / Equipment notes
    /// </summary>
    public string? EquipmentNotes { get; private set; }

    #endregion

    #region Hesaplar (Accounts)

    /// <summary>
    /// E-posta hesabı açıldı mı? / Email account created?
    /// </summary>
    public bool EmailAccountCreated { get; private set; }

    /// <summary>
    /// Active Directory hesabı açıldı mı? / AD account created?
    /// </summary>
    public bool AdAccountCreated { get; private set; }

    /// <summary>
    /// Sistem erişimleri verildi mi? / System access granted?
    /// </summary>
    public bool SystemAccessGranted { get; private set; }

    /// <summary>
    /// VPN erişimi verildi mi? / VPN access granted?
    /// </summary>
    public bool VpnAccessGranted { get; private set; }

    #endregion

    #region Belgeler (Documents)

    /// <summary>
    /// Sözleşme imzalandı mı? / Contract signed?
    /// </summary>
    public bool ContractSigned { get; private set; }

    /// <summary>
    /// NDA imzalandı mı? / NDA signed?
    /// </summary>
    public bool NdaSigned { get; private set; }

    /// <summary>
    /// Politikalar onaylandı mı? / Policies acknowledged?
    /// </summary>
    public bool PoliciesAcknowledged { get; private set; }

    /// <summary>
    /// Banka bilgileri alındı mı? / Bank details received?
    /// </summary>
    public bool BankDetailsReceived { get; private set; }

    /// <summary>
    /// Acil durum bilgileri alındı mı? / Emergency contact received?
    /// </summary>
    public bool EmergencyContactReceived { get; private set; }

    #endregion

    #region Eğitimler (Training)

    /// <summary>
    /// Oryantasyon tamamlandı mı? / Orientation completed?
    /// </summary>
    public bool OrientationCompleted { get; private set; }

    /// <summary>
    /// İSG eğitimi tamamlandı mı? / Safety training completed?
    /// </summary>
    public bool SafetyTrainingCompleted { get; private set; }

    /// <summary>
    /// Compliance eğitimi tamamlandı mı? / Compliance training completed?
    /// </summary>
    public bool ComplianceTrainingCompleted { get; private set; }

    /// <summary>
    /// Ürün eğitimi tamamlandı mı? / Product training completed?
    /// </summary>
    public bool ProductTrainingCompleted { get; private set; }

    #endregion

    #region Geri Bildirim (Feedback)

    /// <summary>
    /// 1. hafta geri bildirimi alındı mı? / Week 1 feedback received?
    /// </summary>
    public bool Week1FeedbackReceived { get; private set; }

    /// <summary>
    /// 1. ay geri bildirimi alındı mı? / Month 1 feedback received?
    /// </summary>
    public bool Month1FeedbackReceived { get; private set; }

    /// <summary>
    /// 3. ay geri bildirimi alındı mı? / Month 3 feedback received?
    /// </summary>
    public bool Month3FeedbackReceived { get; private set; }

    /// <summary>
    /// Çalışan geri bildirimi / Employee feedback
    /// </summary>
    public string? EmployeeFeedback { get; private set; }

    /// <summary>
    /// Yönetici geri bildirimi / Manager feedback
    /// </summary>
    public string? ManagerFeedback { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Hoşgeldin kiti gönderildi mi? / Welcome kit sent?
    /// </summary>
    public bool WelcomeKitSent { get; private set; }

    /// <summary>
    /// Masa/ofis hazırlandı mı? / Desk/office prepared?
    /// </summary>
    public bool DeskPrepared { get; private set; }

    /// <summary>
    /// Takım tanışması yapıldı mı? / Team introduction done?
    /// </summary>
    public bool TeamIntroductionDone { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? Buddy { get; private set; }
    public virtual Employee? HrResponsible { get; private set; }
    public virtual OnboardingTemplate? Template { get; private set; }
    public IReadOnlyList<OnboardingTask> Tasks => _tasks.AsReadOnly();

    protected Onboarding() { }

    public Onboarding(
        int employeeId,
        DateTime firstDayOfWork,
        int? templateId = null)
    {
        EmployeeId = employeeId;
        FirstDayOfWork = firstDayOfWork;
        TemplateId = templateId;
        StartDate = DateTime.UtcNow;
        Status = OnboardingStatus.NotStarted;
    }

    public OnboardingTask AddTask(string title, string? description, OnboardingTaskCategory category, int? assignedToId, DateTime? dueDate, int sortOrder = 0)
    {
        var task = new OnboardingTask(Id, title, description, category, assignedToId, dueDate, sortOrder);
        _tasks.Add(task);
        TotalTasks++;
        UpdateProgress();
        return task;
    }

    public void CompleteTask(int taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null)
        {
            task.Complete();
            CompletedTasks++;
            UpdateProgress();
        }
    }

    private void UpdateProgress()
    {
        CompletionPercentage = TotalTasks > 0
            ? Math.Round((decimal)CompletedTasks / TotalTasks * 100, 2)
            : 0;

        if (CompletionPercentage >= 100 && Status != OnboardingStatus.Completed)
        {
            Complete();
        }
    }

    public void Start()
    {
        Status = OnboardingStatus.InProgress;
    }

    public void Complete()
    {
        Status = OnboardingStatus.Completed;
        ActualEndDate = DateTime.UtcNow;
        CompletionPercentage = 100;
    }

    public void Cancel()
    {
        Status = OnboardingStatus.Cancelled;
    }

    public void SetPlannedEndDate(DateTime date) => PlannedEndDate = date;
    public void SetBuddy(int? buddyId) => BuddyId = buddyId;
    public void SetHrResponsible(int? hrId) => HrResponsibleId = hrId;
    public void SetItResponsible(int? itId) => ItResponsibleId = itId;

    // Equipment methods
    public void ProvideLaptop() => LaptopProvided = true;
    public void ProvidePhone() => PhoneProvided = true;
    public void ProvideAccessCard() => AccessCardProvided = true;
    public void SetLaptopProvided(bool value) => LaptopProvided = value;
    public void SetPhoneProvided(bool value) => PhoneProvided = value;
    public void SetAccessCardProvided(bool value) => AccessCardProvided = value;
    public void SetEquipmentNotes(string? notes) => EquipmentNotes = notes;

    // Account methods
    public void CreateEmailAccount() => EmailAccountCreated = true;
    public void CreateAdAccount() => AdAccountCreated = true;
    public void GrantSystemAccess() => SystemAccessGranted = true;
    public void GrantVpnAccess() => VpnAccessGranted = true;
    public void SetEmailAccountCreated(bool value) => EmailAccountCreated = value;
    public void SetAdAccountCreated(bool value) => AdAccountCreated = value;
    public void SetSystemAccessGranted(bool value) => SystemAccessGranted = value;
    public void SetVpnAccessGranted(bool value) => VpnAccessGranted = value;

    // Document methods
    public void SignContract() => ContractSigned = true;
    public void SignNda() => NdaSigned = true;
    public void AcknowledgePolicies() => PoliciesAcknowledged = true;
    public void ReceiveBankDetails() => BankDetailsReceived = true;
    public void ReceiveEmergencyContact() => EmergencyContactReceived = true;
    public void SetContractSigned(bool value) => ContractSigned = value;
    public void SetNdaSigned(bool value) => NdaSigned = value;
    public void SetPoliciesAcknowledged(bool value) => PoliciesAcknowledged = value;
    public void SetBankDetailsReceived(bool value) => BankDetailsReceived = value;
    public void SetEmergencyContactReceived(bool value) => EmergencyContactReceived = value;

    // Training methods
    public void CompleteOrientation() => OrientationCompleted = true;
    public void CompleteSafetyTraining() => SafetyTrainingCompleted = true;
    public void CompleteComplianceTraining() => ComplianceTrainingCompleted = true;
    public void CompleteProductTraining() => ProductTrainingCompleted = true;
    public void SetOrientationCompleted(bool value) => OrientationCompleted = value;
    public void SetSafetyTrainingCompleted(bool value) => SafetyTrainingCompleted = value;
    public void SetComplianceTrainingCompleted(bool value) => ComplianceTrainingCompleted = value;
    public void SetProductTrainingCompleted(bool value) => ProductTrainingCompleted = value;

    // Feedback methods
    public void ReceiveWeek1Feedback(string? feedback = null)
    {
        Week1FeedbackReceived = true;
        if (!string.IsNullOrEmpty(feedback))
            EmployeeFeedback = feedback;
    }

    public void ReceiveMonth1Feedback(string? feedback = null)
    {
        Month1FeedbackReceived = true;
        if (!string.IsNullOrEmpty(feedback))
            EmployeeFeedback = $"{EmployeeFeedback}\n[Ay 1]: {feedback}".Trim();
    }

    public void ReceiveMonth3Feedback(string? feedback = null)
    {
        Month3FeedbackReceived = true;
        if (!string.IsNullOrEmpty(feedback))
            EmployeeFeedback = $"{EmployeeFeedback}\n[Ay 3]: {feedback}".Trim();
    }

    public void SetManagerFeedback(string? feedback) => ManagerFeedback = feedback;

    // Feedback setter methods
    public void SetWeek1FeedbackReceived(bool value) => Week1FeedbackReceived = value;
    public void SetMonth1FeedbackReceived(bool value) => Month1FeedbackReceived = value;
    public void SetMonth3FeedbackReceived(bool value) => Month3FeedbackReceived = value;
    public void SetEmployeeFeedback(string? feedback) => EmployeeFeedback = feedback;

    // Other methods
    public void SendWelcomeKit() => WelcomeKitSent = true;
    public void PrepareDesk() => DeskPrepared = true;
    public void CompleteTeamIntroduction() => TeamIntroductionDone = true;
    public void SetWelcomeKitSent(bool value) => WelcomeKitSent = value;
    public void SetDeskPrepared(bool value) => DeskPrepared = value;
    public void SetActualEndDate(DateTime? date) => ActualEndDate = date;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Onboarding görevi / Onboarding task
/// </summary>
public class OnboardingTask : BaseEntity
{
    public int OnboardingId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public OnboardingTaskCategory Category { get; private set; }
    public OnboardingTaskStatus Status { get; private set; }
    public int? AssignedToId { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public int SortOrder { get; private set; }
    public string? Notes { get; private set; }

    public virtual Onboarding Onboarding { get; private set; } = null!;
    public virtual Employee? AssignedTo { get; private set; }

    protected OnboardingTask() { }

    public OnboardingTask(
        int onboardingId,
        string title,
        string? description,
        OnboardingTaskCategory category,
        int? assignedToId,
        DateTime? dueDate,
        int sortOrder = 0)
    {
        OnboardingId = onboardingId;
        Title = title;
        Description = description;
        Category = category;
        AssignedToId = assignedToId;
        DueDate = dueDate;
        SortOrder = sortOrder;
        Status = OnboardingTaskStatus.Pending;
    }

    public void Start() => Status = OnboardingTaskStatus.InProgress;
    public void Complete()
    {
        Status = OnboardingTaskStatus.Completed;
        CompletedDate = DateTime.UtcNow;
    }
    public void Skip() => Status = OnboardingTaskStatus.Skipped;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Onboarding şablonu / Onboarding template
/// </summary>
public class OnboardingTemplate : BaseEntity
{
    private readonly List<OnboardingTemplateTask> _tasks = new();

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int? DepartmentId { get; private set; }
    public int? PositionId { get; private set; }
    public int DurationDays { get; private set; }
    public bool IsActive { get; private set; }

    public virtual Department? Department { get; private set; }
    public virtual Position? Position { get; private set; }
    public IReadOnlyList<OnboardingTemplateTask> Tasks => _tasks.AsReadOnly();

    protected OnboardingTemplate() { }

    public OnboardingTemplate(string name, int durationDays = 30)
    {
        Name = name;
        DurationDays = durationDays;
        IsActive = true;
    }

    public OnboardingTemplateTask AddTask(string title, string? description, OnboardingTaskCategory category, int daysFromStart, int sortOrder = 0)
    {
        var task = new OnboardingTemplateTask(Id, title, description, category, daysFromStart, sortOrder);
        _tasks.Add(task);
        return task;
    }

    public void SetDescription(string? description) => Description = description;
    public void SetDepartment(int? departmentId) => DepartmentId = departmentId;
    public void SetPosition(int? positionId) => PositionId = positionId;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Onboarding şablon görevi / Onboarding template task
/// </summary>
public class OnboardingTemplateTask : BaseEntity
{
    public int TemplateId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public OnboardingTaskCategory Category { get; private set; }
    public int DaysFromStart { get; private set; }
    public int SortOrder { get; private set; }
    public string? DefaultAssigneeRole { get; private set; }

    public virtual OnboardingTemplate Template { get; private set; } = null!;

    protected OnboardingTemplateTask() { }

    public OnboardingTemplateTask(
        int templateId,
        string title,
        string? description,
        OnboardingTaskCategory category,
        int daysFromStart,
        int sortOrder = 0)
    {
        TemplateId = templateId;
        Title = title;
        Description = description;
        Category = category;
        DaysFromStart = daysFromStart;
        SortOrder = sortOrder;
    }
}

#region Enums

public enum OnboardingStatus
{
    /// <summary>Başlamadı / Not started</summary>
    NotStarted = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 4
}

public enum OnboardingTaskStatus
{
    /// <summary>Beklemede / Pending</summary>
    Pending = 1,

    /// <summary>Devam ediyor / In progress</summary>
    InProgress = 2,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 3,

    /// <summary>Atlandı / Skipped</summary>
    Skipped = 4
}

public enum OnboardingTaskCategory
{
    /// <summary>Belgeler / Documentation</summary>
    Documentation = 1,

    /// <summary>IT / IT setup</summary>
    IT = 2,

    /// <summary>Ekipman / Equipment</summary>
    Equipment = 3,

    /// <summary>Eğitim / Training</summary>
    Training = 4,

    /// <summary>Tanışma / Introduction</summary>
    Introduction = 5,

    /// <summary>İdari / Administrative</summary>
    Administrative = 6,

    /// <summary>Güvenlik / Security</summary>
    Security = 7,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
