using FluentValidation;
using MediatR;
using Stocker.Application.Common.Validators;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Commands;

/// <summary>
/// Command to create a new employee
/// </summary>
public record CreateEmployeeCommand : IRequest<Result<EmployeeDto>>
{
    public CreateEmployeeDto EmployeeData { get; init; } = null!;
}

/// <summary>
/// Validator for CreateEmployeeCommand - Türkçe doğrulama kuralları
/// </summary>
public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(x => x.EmployeeData)
            .NotNull().WithMessage("Çalışan bilgileri zorunludur.");

        When(x => x.EmployeeData != null, () =>
        {
            RuleFor(x => x.EmployeeData.EmployeeCode)
                .NotEmpty().WithMessage("Çalışan kodu zorunludur.")
                .ValidCode(2, 50);

            RuleFor(x => x.EmployeeData.FirstName)
                .NotEmpty().WithMessage("Ad zorunludur.")
                .MaximumLength(100).WithMessage("Ad en fazla 100 karakter olabilir.");

            RuleFor(x => x.EmployeeData.LastName)
                .NotEmpty().WithMessage("Soyad zorunludur.")
                .MaximumLength(100).WithMessage("Soyad en fazla 100 karakter olabilir.");

            // TC Kimlik Numarası doğrulaması (Türkiye'ye özgü)
            RuleFor(x => x.EmployeeData.NationalId)
                .NotEmpty().WithMessage("TC Kimlik numarası zorunludur.")
                .TurkishNationalId();

            RuleFor(x => x.EmployeeData.Email)
                .NotEmpty().WithMessage("E-posta adresi zorunludur.")
                .EmailAddress().WithMessage("Geçersiz e-posta formatı.");

            // Telefon numarası doğrulaması (Türkiye formatı)
            RuleFor(x => x.EmployeeData.Phone)
                .NotEmpty().WithMessage("Telefon numarası zorunludur.")
                .TurkishPhoneNumber();

            RuleFor(x => x.EmployeeData.DepartmentId)
                .GreaterThan(0).WithMessage("Departman seçimi zorunludur.");

            RuleFor(x => x.EmployeeData.PositionId)
                .GreaterThan(0).WithMessage("Pozisyon seçimi zorunludur.");

            RuleFor(x => x.EmployeeData.HireDate)
                .NotEmpty().WithMessage("İşe başlama tarihi zorunludur.");

            // Maaş doğrulaması
            RuleFor(x => x.EmployeeData.BaseSalary)
                .ValidMoney();

            // IBAN doğrulaması (opsiyonel ama girilirse Türk IBAN formatı)
            RuleFor(x => x.EmployeeData.IBAN)
                .TurkishIban()
                .When(x => !string.IsNullOrEmpty(x.EmployeeData.IBAN));

            // Vergi numarası doğrulaması (opsiyonel)
            RuleFor(x => x.EmployeeData.TaxNumber)
                .TurkishTaxNumber()
                .When(x => !string.IsNullOrEmpty(x.EmployeeData.TaxNumber));
        });
    }
}

/// <summary>
/// Handler for CreateEmployeeCommand
/// </summary>
public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Result<EmployeeDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateEmployeeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDto>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var data = request.EmployeeData;

        // Check if employee with same code already exists
        if (await _unitOfWork.Employees.ExistsWithCodeAsync(data.EmployeeCode, cancellationToken: cancellationToken))
        {
            return Result<EmployeeDto>.Failure(
                Error.Conflict("Employee.Code", "An employee with this code already exists"));
        }

        // Check if email already exists
        if (await _unitOfWork.Employees.ExistsWithEmailAsync(data.Email, cancellationToken: cancellationToken))
        {
            return Result<EmployeeDto>.Failure(
                Error.Conflict("Employee.Email", "An employee with this email already exists"));
        }

        // Validate department
        var department = await _unitOfWork.Departments.GetByIdAsync(data.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Department", $"Department with ID {data.DepartmentId} not found"));
        }

        // Validate position
        var position = await _unitOfWork.Positions.GetByIdAsync(data.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Position", $"Position with ID {data.PositionId} not found"));
        }

        // Validate manager if specified
        string? managerName = null;
        if (data.ManagerId.HasValue)
        {
            var manager = await _unitOfWork.Employees.GetByIdAsync(data.ManagerId.Value, cancellationToken);
            if (manager == null)
            {
                return Result<EmployeeDto>.Failure(
                    Error.NotFound("Manager", $"Manager with ID {data.ManagerId} not found"));
            }
            managerName = $"{manager.FirstName} {manager.LastName}";
        }

        // Create value objects
        var emailResult = Email.Create(data.Email);
        if (!emailResult.IsSuccess)
        {
            return Result<EmployeeDto>.Failure(emailResult.Error);
        }

        var phoneResult = PhoneNumber.Create(data.Phone);
        if (!phoneResult.IsSuccess)
        {
            return Result<EmployeeDto>.Failure(phoneResult.Error);
        }

        // Create the employee
        var employee = new Employee(
            data.EmployeeCode,
            data.FirstName,
            data.LastName,
            data.NationalId,
            data.BirthDate,
            data.Gender,
            emailResult.Value,
            phoneResult.Value,
            data.DepartmentId,
            data.PositionId,
            data.HireDate,
            data.EmploymentType,
            data.BaseSalary,
            data.Currency,
            data.PayrollPeriod);

        // Set tenant ID
        employee.SetTenantId(_unitOfWork.TenantId);

        // Set manager if specified
        if (data.ManagerId.HasValue)
        {
            employee.SetManager(data.ManagerId);
        }

        // Set optional personal info
        if (!string.IsNullOrEmpty(data.MiddleName) || !string.IsNullOrEmpty(data.BirthPlace) ||
            !string.IsNullOrEmpty(data.MaritalStatus) || !string.IsNullOrEmpty(data.Nationality))
        {
            employee.UpdatePersonalInfo(
                data.FirstName,
                data.LastName,
                data.MiddleName,
                data.BirthDate,
                data.BirthPlace,
                data.Gender,
                data.MaritalStatus,
                data.Nationality,
                data.BloodType);
        }

        // Set contact info if optional fields are provided
        if (!string.IsNullOrEmpty(data.PersonalEmail) || !string.IsNullOrEmpty(data.MobilePhone) ||
            !string.IsNullOrEmpty(data.Street))
        {
            Email? personalEmail = null;
            if (!string.IsNullOrEmpty(data.PersonalEmail))
            {
                var personalEmailResult = Email.Create(data.PersonalEmail);
                if (personalEmailResult.IsSuccess)
                    personalEmail = personalEmailResult.Value;
            }

            PhoneNumber? mobilePhone = null;
            if (!string.IsNullOrEmpty(data.MobilePhone))
            {
                var mobilePhoneResult = PhoneNumber.Create(data.MobilePhone);
                if (mobilePhoneResult.IsSuccess)
                    mobilePhone = mobilePhoneResult.Value;
            }

            Address? address = null;
            if (!string.IsNullOrEmpty(data.Street))
            {
                address = Address.Create(data.Street, data.City ?? "", data.Country ?? "", data.PostalCode, state: data.State);
            }
            employee.UpdateContactInfo(emailResult.Value, personalEmail, phoneResult.Value, mobilePhone, address);
        }

        // Set bank info if provided
        if (!string.IsNullOrEmpty(data.BankName) || !string.IsNullOrEmpty(data.IBAN))
        {
            employee.SetBankInfo(data.BankName, data.BankBranch, data.BankAccountNumber, data.IBAN);
        }

        // Set emergency contact if provided
        if (!string.IsNullOrEmpty(data.EmergencyContactName))
        {
            employee.SetEmergencyContact(data.EmergencyContactName, data.EmergencyContactPhone, data.EmergencyContactRelation);
        }

        // Set tax info if provided
        if (!string.IsNullOrEmpty(data.SocialSecurityNumber) || !string.IsNullOrEmpty(data.TaxNumber))
        {
            employee.SetTaxInfo(data.SocialSecurityNumber, data.TaxNumber, data.TaxOffice);
        }

        // Set probation if specified
        if (data.ProbationEndDate.HasValue)
        {
            employee.StartProbation(data.ProbationEndDate.Value);
        }

        // Save to repository
        await _unitOfWork.Employees.AddAsync(employee, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var employeeDto = new EmployeeDto
        {
            Id = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            MiddleName = employee.MiddleName,
            NationalId = employee.NationalId,
            BirthDate = employee.BirthDate,
            Gender = employee.Gender,
            MaritalStatus = employee.MaritalStatus,
            Nationality = employee.Nationality,
            Email = employee.Email.Value,
            Phone = employee.Phone.Value,
            DepartmentId = employee.DepartmentId,
            DepartmentName = department.Name,
            PositionId = employee.PositionId,
            PositionTitle = position.Title,
            ManagerId = employee.ManagerId,
            ManagerName = managerName,
            HireDate = employee.HireDate,
            ProbationEndDate = employee.ProbationEndDate,
            EmploymentType = employee.EmploymentType,
            Status = employee.Status,
            BaseSalary = employee.BaseSalary,
            Currency = employee.Currency,
            PayrollPeriod = employee.PayrollPeriod,
            IsActive = !employee.IsDeleted,
            CreatedAt = employee.CreatedDate
        };

        return Result<EmployeeDto>.Success(employeeDto);
    }
}
