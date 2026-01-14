using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan entity'si
/// </summary>
public class Employee : BaseEntity
{
    // Temel Bilgiler
    public string EmployeeCode { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string FullName => $"{FirstName} {LastName}";
    public string? MiddleName { get; private set; }
    public string NationalId { get; private set; }
    public DateTime BirthDate { get; private set; }
    public string? BirthPlace { get; private set; }
    public Gender Gender { get; private set; }
    public string? MaritalStatus { get; private set; }
    public string? Nationality { get; private set; }
    public string? BloodType { get; private set; }

    // İletişim Bilgileri
    public Email Email { get; private set; }
    public Email? PersonalEmail { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public PhoneNumber? MobilePhone { get; private set; }
    public Address? Address { get; private set; }

    // İş Bilgileri
    public int DepartmentId { get; private set; }
    public int PositionId { get; private set; }
    public int? ManagerId { get; private set; }
    public int? ShiftId { get; private set; }
    public DateTime HireDate { get; private set; }
    public DateTime? OriginalHireDate { get; private set; }
    public DateTime? TerminationDate { get; private set; }
    public string? TerminationReason { get; private set; }
    public EmploymentType EmploymentType { get; private set; }
    public EmployeeStatus Status { get; private set; }
    public DateTime? ProbationEndDate { get; private set; }

    // Maaş Bilgileri
    public decimal BaseSalary { get; private set; }
    public string Currency { get; private set; }
    public PayrollPeriod PayrollPeriod { get; private set; }

    // Banka Bilgileri
    public string? BankName { get; private set; }
    public string? BankBranch { get; private set; }
    public string? BankAccountNumber { get; private set; }
    public string? IBAN { get; private set; }

    // Acil Durum İletişim
    public string? EmergencyContactName { get; private set; }
    public string? EmergencyContactPhone { get; private set; }
    public string? EmergencyContactRelation { get; private set; }

    // SGK ve Vergi Bilgileri
    public string? SocialSecurityNumber { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }

    // Ek Bilgiler
    public string? PhotoUrl { get; private set; }
    public string? Notes { get; private set; }
    public int? WorkLocationId { get; private set; }

    // Navigation Properties
    public virtual Department Department { get; private set; } = null!;
    public virtual Position Position { get; private set; } = null!;
    public virtual Employee? Manager { get; private set; }
    public virtual Shift? Shift { get; private set; }
    public virtual ICollection<Employee> Subordinates { get; private set; }
    public virtual ICollection<Leave> Leaves { get; private set; }
    public virtual ICollection<Attendance> Attendances { get; private set; }
    public virtual ICollection<EmployeeDocument> Documents { get; private set; }
    public virtual ICollection<EmployeeTraining> Trainings { get; private set; }
    public virtual ICollection<PerformanceReview> PerformanceReviews { get; private set; }
    public virtual ICollection<Expense> Expenses { get; private set; }
    public virtual ICollection<Payroll> Payrolls { get; private set; }
    public virtual ICollection<LeaveBalance> LeaveBalances { get; private set; }

    protected Employee()
    {
        EmployeeCode = string.Empty;
        FirstName = string.Empty;
        LastName = string.Empty;
        NationalId = string.Empty;
        Email = null!;
        Phone = null!;
        Currency = "TRY";
        Subordinates = new List<Employee>();
        Leaves = new List<Leave>();
        Attendances = new List<Attendance>();
        Documents = new List<EmployeeDocument>();
        Trainings = new List<EmployeeTraining>();
        PerformanceReviews = new List<PerformanceReview>();
        Expenses = new List<Expense>();
        Payrolls = new List<Payroll>();
        LeaveBalances = new List<LeaveBalance>();
    }

    public Employee(
        string employeeCode,
        string firstName,
        string lastName,
        string nationalId,
        DateTime birthDate,
        Gender gender,
        Email email,
        PhoneNumber phone,
        int departmentId,
        int positionId,
        DateTime hireDate,
        EmploymentType employmentType,
        decimal baseSalary,
        string currency = "TRY",
        PayrollPeriod payrollPeriod = PayrollPeriod.Monthly)
    {
        EmployeeCode = employeeCode;
        FirstName = firstName;
        LastName = lastName;
        NationalId = nationalId;
        BirthDate = birthDate;
        Gender = gender;
        Email = email;
        Phone = phone;
        DepartmentId = departmentId;
        PositionId = positionId;
        HireDate = hireDate;
        OriginalHireDate = hireDate;
        EmploymentType = employmentType;
        BaseSalary = baseSalary;
        Currency = currency;
        PayrollPeriod = payrollPeriod;
        Status = EmployeeStatus.Active;
        Subordinates = new List<Employee>();
        Leaves = new List<Leave>();
        Attendances = new List<Attendance>();
        Documents = new List<EmployeeDocument>();
        Trainings = new List<EmployeeTraining>();
        PerformanceReviews = new List<PerformanceReview>();
        Expenses = new List<Expense>();
        Payrolls = new List<Payroll>();
        LeaveBalances = new List<LeaveBalance>();
    }

    public void UpdatePersonalInfo(
        string firstName,
        string lastName,
        string? middleName,
        DateTime birthDate,
        string? birthPlace,
        Gender gender,
        string? maritalStatus,
        string? nationality,
        string? bloodType)
    {
        FirstName = firstName;
        LastName = lastName;
        MiddleName = middleName;
        BirthDate = birthDate;
        BirthPlace = birthPlace;
        Gender = gender;
        MaritalStatus = maritalStatus;
        Nationality = nationality;
        BloodType = bloodType;
    }

    public void UpdateContactInfo(
        Email email,
        Email? personalEmail,
        PhoneNumber phone,
        PhoneNumber? mobilePhone,
        Address? address)
    {
        Email = email;
        PersonalEmail = personalEmail;
        Phone = phone;
        MobilePhone = mobilePhone;
        Address = address;
    }

    public void UpdateJobInfo(
        int departmentId,
        int positionId,
        EmploymentType employmentType,
        int? shiftId = null)
    {
        DepartmentId = departmentId;
        PositionId = positionId;
        EmploymentType = employmentType;
        ShiftId = shiftId;
    }

    public void SetManager(int? managerId)
    {
        ManagerId = managerId;
    }

    public void UpdateSalary(decimal baseSalary, string currency, PayrollPeriod payrollPeriod)
    {
        BaseSalary = baseSalary;
        Currency = currency;
        PayrollPeriod = payrollPeriod;
    }

    public void SetBankInfo(string? bankName, string? bankBranch, string? accountNumber, string? iban)
    {
        BankName = bankName;
        BankBranch = bankBranch;
        BankAccountNumber = accountNumber;
        IBAN = iban;
    }

    public void SetEmergencyContact(string? contactName, string? contactPhone, string? relation)
    {
        EmergencyContactName = contactName;
        EmergencyContactPhone = contactPhone;
        EmergencyContactRelation = relation;
    }

    public void SetTaxInfo(string? socialSecurityNumber, string? taxNumber, string? taxOffice)
    {
        SocialSecurityNumber = socialSecurityNumber;
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
    }

    public void SetPhotoUrl(string? photoUrl)
    {
        PhotoUrl = photoUrl;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void StartProbation(DateTime probationEndDate)
    {
        Status = EmployeeStatus.Probation;
        ProbationEndDate = probationEndDate;
    }

    public void CompleteProbation()
    {
        Status = EmployeeStatus.Active;
        ProbationEndDate = null;
    }

    public void Terminate(DateTime terminationDate, string? reason = null)
    {
        TerminationDate = terminationDate;
        TerminationReason = reason;
        Status = EmployeeStatus.Terminated;
    }

    public void Resign(DateTime resignationDate, string? reason = null)
    {
        TerminationDate = resignationDate;
        TerminationReason = reason;
        Status = EmployeeStatus.Resigned;
    }

    public void Retire(DateTime retirementDate)
    {
        TerminationDate = retirementDate;
        Status = EmployeeStatus.Retired;
    }

    public void Reactivate()
    {
        TerminationDate = null;
        TerminationReason = null;
        Status = EmployeeStatus.Active;
    }

    public void SetStatus(EmployeeStatus status)
    {
        Status = status;
    }

    public int GetYearsOfService()
    {
        var endDate = TerminationDate ?? DateTime.UtcNow;
        return (int)((endDate - HireDate).TotalDays / 365.25);
    }

    public int GetAge()
    {
        var today = DateTime.UtcNow;
        var age = today.Year - BirthDate.Year;
        if (BirthDate.Date > today.AddYears(-age)) age--;
        return age;
    }

    public bool IsOnProbation()
    {
        return Status == EmployeeStatus.Probation &&
               ProbationEndDate.HasValue &&
               ProbationEndDate.Value > DateTime.UtcNow;
    }

    #region KVKK Compliance Methods

    /// <summary>
    /// KVKK Madde 7 - Kişisel verilerin silinmesi (Unutulma Hakkı)
    /// Yasal saklama süreleri dışındaki kişisel verileri siler
    /// </summary>
    public void DeletePersonalData()
    {
        // Kişisel bilgiler
        FirstName = "SİLİNDİ";
        LastName = "SİLİNDİ";
        MiddleName = null;
        NationalId = "***********";
        BirthPlace = null;
        MaritalStatus = null;
        Nationality = null;
        BloodType = null;

        // İletişim bilgileri
        PersonalEmail = null;
        MobilePhone = null;
        Address = null;

        // Banka bilgileri
        BankName = null;
        BankBranch = null;
        BankAccountNumber = null;
        IBAN = null;

        // Acil durum iletişim
        EmergencyContactName = null;
        EmergencyContactPhone = null;
        EmergencyContactRelation = null;

        // Ek bilgiler
        PhotoUrl = null;
        Notes = null;
    }

    /// <summary>
    /// KVKK Madde 7 - Kişisel verilerin anonim hale getirilmesi
    /// Verileri geri dönüşü olmayacak şekilde anonimleştirir
    /// </summary>
    public void AnonymizePersonalData()
    {
        var anonymizedId = $"ANON-{Guid.NewGuid():N}".Substring(0, 20);

        // Kişisel bilgiler - anonimleştir
        FirstName = "Anonim";
        LastName = anonymizedId;
        MiddleName = null;
        NationalId = new string('*', 11);
        BirthDate = new DateTime(1900, 1, 1); // Tarihi anonimleştir
        BirthPlace = null;
        MaritalStatus = null;
        Nationality = null;
        BloodType = null;

        // İletişim bilgileri - anonimleştir
        Email = Email.Create($"{anonymizedId}@anonymized.local").Value;
        PersonalEmail = null;
        Phone = PhoneNumber.Create("+900000000000").Value;
        MobilePhone = null;
        Address = null;

        // Banka bilgileri - temizle
        BankName = null;
        BankBranch = null;
        BankAccountNumber = null;
        IBAN = null;

        // Acil durum iletişim - temizle
        EmergencyContactName = null;
        EmergencyContactPhone = null;
        EmergencyContactRelation = null;

        // SGK ve Vergi bilgileri - anonimleştir
        SocialSecurityNumber = new string('*', 11);
        TaxNumber = null;
        TaxOffice = null;

        // Ek bilgiler - temizle
        PhotoUrl = null;
        Notes = null;
    }

    /// <summary>
    /// KVKK Madde 11 - Kişisel veri taşınabilirliği hakkı
    /// Tüm kişisel verileri makine tarafından okunabilir formatta dışa aktarır
    /// </summary>
    /// <returns>JSON formatında kişisel veriler</returns>
    public Dictionary<string, object?> ExportPersonalData()
    {
        return new Dictionary<string, object?>
        {
            // Kimlik bilgileri
            { "employeeCode", EmployeeCode },
            { "firstName", FirstName },
            { "lastName", LastName },
            { "middleName", MiddleName },
            { "nationalId", NationalId },
            { "birthDate", BirthDate.ToString("yyyy-MM-dd") },
            { "birthPlace", BirthPlace },
            { "gender", Gender.ToString() },
            { "maritalStatus", MaritalStatus },
            { "nationality", Nationality },
            { "bloodType", BloodType },

            // İletişim bilgileri
            { "email", Email?.Value },
            { "personalEmail", PersonalEmail?.Value },
            { "phone", Phone?.Value },
            { "mobilePhone", MobilePhone?.Value },
            { "address", Address != null ? new Dictionary<string, string?>
                {
                    { "street", Address.Street },
                    { "city", Address.City },
                    { "state", Address.State },
                    { "country", Address.Country },
                    { "postalCode", Address.PostalCode }
                } : null
            },

            // İş bilgileri
            { "hireDate", HireDate.ToString("yyyy-MM-dd") },
            { "originalHireDate", OriginalHireDate?.ToString("yyyy-MM-dd") },
            { "terminationDate", TerminationDate?.ToString("yyyy-MM-dd") },
            { "terminationReason", TerminationReason },
            { "employmentType", EmploymentType.ToString() },
            { "status", Status.ToString() },

            // Maaş bilgileri
            { "baseSalary", BaseSalary },
            { "currency", Currency },
            { "payrollPeriod", PayrollPeriod.ToString() },

            // Banka bilgileri
            { "bankName", BankName },
            { "bankBranch", BankBranch },
            { "bankAccountNumber", BankAccountNumber != null ? MaskBankAccount(BankAccountNumber) : null },
            { "iban", IBAN != null ? MaskIban(IBAN) : null },

            // Acil durum iletişim
            { "emergencyContactName", EmergencyContactName },
            { "emergencyContactPhone", EmergencyContactPhone },
            { "emergencyContactRelation", EmergencyContactRelation },

            // SGK ve Vergi bilgileri
            { "socialSecurityNumber", SocialSecurityNumber != null ? MaskSocialSecurity(SocialSecurityNumber) : null },
            { "taxNumber", TaxNumber },
            { "taxOffice", TaxOffice },

            // Meta veriler
            { "exportDate", DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") },
            { "dataController", "Stocker ERP" }
        };
    }

    /// <summary>
    /// KVKK kapsamında kişisel verilerin işlenme durumunu kontrol eder
    /// </summary>
    /// <returns>Veri saklama süresinin dolup dolmadığı</returns>
    public bool IsDataRetentionExpired()
    {
        // İş Kanunu'na göre 10 yıl saklama süresi
        const int retentionYears = 10;

        if (!TerminationDate.HasValue)
            return false;

        return TerminationDate.Value.AddYears(retentionYears) < DateTime.UtcNow;
    }

    /// <summary>
    /// Veri sorumlusuna bildirim için kişisel veri envanteri oluşturur
    /// </summary>
    public Dictionary<string, string> GetPersonalDataInventory()
    {
        return new Dictionary<string, string>
        {
            { "Kimlik Bilgileri", "Ad, Soyad, TC Kimlik No, Doğum Tarihi/Yeri" },
            { "İletişim Bilgileri", "E-posta, Telefon, Adres" },
            { "Finansal Bilgiler", "Maaş, Banka Hesap Bilgileri, IBAN" },
            { "Çalışma Bilgileri", "İşe Giriş Tarihi, Departman, Pozisyon" },
            { "Sağlık Bilgileri", "Kan Grubu" },
            { "Resmi Kimlik Bilgileri", "SGK No, Vergi No" },
            { "Acil Durum Bilgileri", "Acil İletişim Kişisi" }
        };
    }

    private static string MaskBankAccount(string accountNumber)
    {
        if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length < 4)
            return new string('*', accountNumber?.Length ?? 0);
        return new string('*', accountNumber.Length - 4) + accountNumber.Substring(accountNumber.Length - 4);
    }

    private static string MaskIban(string iban)
    {
        if (string.IsNullOrEmpty(iban) || iban.Length < 4)
            return new string('*', iban?.Length ?? 0);
        return iban.Substring(0, 4) + new string('*', iban.Length - 8) + iban.Substring(iban.Length - 4);
    }

    private static string MaskSocialSecurity(string ssn)
    {
        if (string.IsNullOrEmpty(ssn) || ssn.Length < 4)
            return new string('*', ssn?.Length ?? 0);
        return new string('*', ssn.Length - 4) + ssn.Substring(ssn.Length - 4);
    }

    #endregion
}
