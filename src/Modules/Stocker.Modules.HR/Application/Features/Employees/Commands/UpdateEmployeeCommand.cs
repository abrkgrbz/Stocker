using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Commands;

/// <summary>
/// Command to update an employee
/// </summary>
public class UpdateEmployeeCommand : IRequest<Result<EmployeeDto>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public UpdateEmployeeDto EmployeeData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateEmployeeCommand
/// </summary>
public class UpdateEmployeeCommandValidator : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.EmployeeData)
            .NotNull().WithMessage("Employee data is required");

        When(x => x.EmployeeData != null, () =>
        {
            RuleFor(x => x.EmployeeData.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(x => x.EmployeeData.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(x => x.EmployeeData.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.EmployeeData.Phone)
                .NotEmpty().WithMessage("Phone is required");

            RuleFor(x => x.EmployeeData.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID is required");

            RuleFor(x => x.EmployeeData.PositionId)
                .GreaterThan(0).WithMessage("Position ID is required");
        });
    }
}

/// <summary>
/// Handler for UpdateEmployeeCommand
/// </summary>
public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Result<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPositionRepository _positionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEmployeeCommandHandler(
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository,
        IPositionRepository positionRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _positionRepository = positionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDto>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var data = request.EmployeeData;

        // Get existing employee
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Check if email already exists (for another employee)
        if (await _employeeRepository.ExistsWithEmailAsync(data.Email, request.EmployeeId, cancellationToken))
        {
            return Result<EmployeeDto>.Failure(
                Error.Conflict("Employee.Email", "An employee with this email already exists"));
        }

        // Validate department
        var department = await _departmentRepository.GetByIdAsync(data.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Department", $"Department with ID {data.DepartmentId} not found"));
        }

        // Validate position
        var position = await _positionRepository.GetByIdAsync(data.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Position", $"Position with ID {data.PositionId} not found"));
        }

        // Validate manager if specified
        string? managerName = null;
        if (data.ManagerId.HasValue)
        {
            if (data.ManagerId.Value == request.EmployeeId)
            {
                return Result<EmployeeDto>.Failure(
                    Error.Validation("Employee.ManagerId", "An employee cannot be their own manager"));
            }

            var manager = await _employeeRepository.GetByIdAsync(data.ManagerId.Value, cancellationToken);
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

        // Create address if street is provided
        Address? address = null;
        if (!string.IsNullOrEmpty(data.Street))
        {
            address = Address.Create(data.Street, data.City ?? "", data.Country ?? "", data.PostalCode, state: data.State);
        }

        // Update personal info
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

        // Update contact info
        employee.UpdateContactInfo(emailResult.Value, personalEmail, phoneResult.Value, mobilePhone, address);

        // Update job info
        employee.UpdateJobInfo(data.DepartmentId, data.PositionId, data.EmploymentType, data.ShiftId);

        // Update manager
        employee.SetManager(data.ManagerId);

        // Update salary
        employee.UpdateSalary(data.BaseSalary, data.Currency, data.PayrollPeriod);

        // Update bank info
        employee.SetBankInfo(data.BankName, data.BankBranch, data.BankAccountNumber, data.IBAN);

        // Update emergency contact
        employee.SetEmergencyContact(data.EmergencyContactName, data.EmergencyContactPhone, data.EmergencyContactRelation);

        // Update tax info
        employee.SetTaxInfo(data.SocialSecurityNumber, data.TaxNumber, data.TaxOffice);

        // Handle probation
        if (data.ProbationEndDate.HasValue && employee.Status != Domain.Enums.EmployeeStatus.Probation)
        {
            employee.StartProbation(data.ProbationEndDate.Value);
        }
        else if (!data.ProbationEndDate.HasValue && employee.Status == Domain.Enums.EmployeeStatus.Probation)
        {
            employee.CompleteProbation();
        }

        // Save changes
        _employeeRepository.Update(employee);
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
            TerminationDate = employee.TerminationDate,
            TerminationReason = employee.TerminationReason,
            EmploymentType = employee.EmploymentType,
            Status = employee.Status,
            BaseSalary = employee.BaseSalary,
            Currency = employee.Currency,
            PayrollPeriod = employee.PayrollPeriod,
            BankName = employee.BankName,
            IBAN = employee.IBAN,
            EmergencyContactName = employee.EmergencyContactName,
            EmergencyContactPhone = employee.EmergencyContactPhone,
            EmergencyContactRelation = employee.EmergencyContactRelation,
            IsActive = !employee.IsDeleted,
            CreatedAt = employee.CreatedDate,
            UpdatedAt = employee.UpdatedDate
        };

        return Result<EmployeeDto>.Success(employeeDto);
    }
}
