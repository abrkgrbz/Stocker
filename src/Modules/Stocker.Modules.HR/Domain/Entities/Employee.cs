using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.HR.Domain.Entities;

public class Employee : BaseEntity
{
    public string EmployeeCode { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string FullName => $"{FirstName} {LastName}";
    public string NationalId { get; private set; }
    public DateTime BirthDate { get; private set; }
    public string Gender { get; private set; }
    public Email Email { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public PhoneNumber? MobilePhone { get; private set; }
    public Address? Address { get; private set; }
    public int DepartmentId { get; private set; }
    public int PositionId { get; private set; }
    public int? ManagerId { get; private set; }
    public DateTime HireDate { get; private set; }
    public DateTime? TerminationDate { get; private set; }
    public string EmploymentType { get; private set; }
    public decimal Salary { get; private set; }
    public string Currency { get; private set; }
    public string? EmergencyContact { get; private set; }
    public string? EmergencyPhone { get; private set; }
    public string? BankName { get; private set; }
    public string? BankAccount { get; private set; }
    public string? IBAN { get; private set; }
    public bool IsActive { get; private set; }
    public string? PhotoUrl { get; private set; }
    
    public virtual Position Position { get; private set; }
    public virtual Employee? Manager { get; private set; }
    public virtual ICollection<Employee> Subordinates { get; private set; }
    public virtual ICollection<Leave> Leaves { get; private set; }
    public virtual ICollection<Attendance> Attendances { get; private set; }
    
    protected Employee() { }
    
    public Employee(
        string employeeCode,
        string firstName,
        string lastName,
        string nationalId,
        DateTime birthDate,
        string gender,
        Email email,
        PhoneNumber phone,
        int departmentId,
        int positionId,
        DateTime hireDate,
        string employmentType,
        decimal salary,
        string currency = "TRY")
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
        EmploymentType = employmentType;
        Salary = salary;
        Currency = currency;
        IsActive = true;
        Subordinates = new List<Employee>();
        Leaves = new List<Leave>();
        Attendances = new List<Attendance>();
    }
    
    public void UpdatePersonalInfo(
        string firstName,
        string lastName,
        Email email,
        PhoneNumber phone,
        PhoneNumber? mobilePhone,
        Address? address)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        MobilePhone = mobilePhone;
        Address = address;
    }
    
    public void UpdatePosition(int departmentId, int positionId)
    {
        DepartmentId = departmentId;
        PositionId = positionId;
    }
    
    public void SetManager(int? managerId)
    {
        ManagerId = managerId;
    }
    
    public void UpdateSalary(decimal salary, string currency)
    {
        Salary = salary;
        Currency = currency;
    }
    
    public void SetEmergencyContact(string contactName, string contactPhone)
    {
        EmergencyContact = contactName;
        EmergencyPhone = contactPhone;
    }
    
    public void SetBankInfo(string bankName, string bankAccount, string iban)
    {
        BankName = bankName;
        BankAccount = bankAccount;
        IBAN = iban;
    }
    
    public void Terminate(DateTime terminationDate)
    {
        TerminationDate = terminationDate;
        IsActive = false;
    }
    
    public void Reactivate()
    {
        TerminationDate = null;
        IsActive = true;
    }
    
    public int GetYearsOfService()
    {
        var endDate = TerminationDate ?? DateTime.UtcNow;
        return (int)((endDate - HireDate).TotalDays / 365.25);
    }
}