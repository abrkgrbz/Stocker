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
}
