using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Queries;

/// <summary>
/// Query to get an employee by ID
/// </summary>
public record GetEmployeeByIdQuery(int EmployeeId) : IRequest<Result<EmployeeDto>>;

/// <summary>
/// Handler for GetEmployeeByIdQuery
/// </summary>
public class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, Result<EmployeeDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDto>> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var employee = await _unitOfWork.Employees.GetWithDetailsAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Get related entity names - DepartmentId and PositionId are required (non-nullable int)
        var department = await _unitOfWork.Departments.GetByIdAsync(employee.DepartmentId, cancellationToken);
        var departmentName = department?.Name;

        var position = await _unitOfWork.Positions.GetByIdAsync(employee.PositionId, cancellationToken);
        var positionTitle = position?.Title;

        string? managerName = null;
        if (employee.ManagerId.HasValue)
        {
            var manager = await _unitOfWork.Employees.GetByIdAsync(employee.ManagerId.Value, cancellationToken);
            managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
        }

        string? shiftName = null;
        if (employee.ShiftId.HasValue)
        {
            var shift = await _unitOfWork.Shifts.GetByIdAsync(employee.ShiftId.Value, cancellationToken);
            shiftName = shift?.Name;
        }

        string? workLocationName = null;
        if (employee.WorkLocationId.HasValue)
        {
            var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(employee.WorkLocationId.Value, cancellationToken);
            workLocationName = workLocation?.Name;
        }

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
            PhotoUrl = employee.PhotoUrl,
            Email = employee.Email?.Value,
            PersonalEmail = employee.PersonalEmail?.Value,
            Phone = employee.Phone?.Value,
            MobilePhone = employee.MobilePhone?.Value,
            Street = employee.Address?.Street,
            City = employee.Address?.City,
            State = employee.Address?.State,
            PostalCode = employee.Address?.PostalCode,
            Country = employee.Address?.Country,
            DepartmentId = employee.DepartmentId,
            DepartmentName = departmentName,
            PositionId = employee.PositionId,
            PositionTitle = positionTitle,
            ManagerId = employee.ManagerId,
            ManagerName = managerName,
            ShiftId = employee.ShiftId,
            ShiftName = shiftName,
            WorkLocationId = employee.WorkLocationId,
            WorkLocationName = workLocationName,
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
            IBAN = !string.IsNullOrEmpty(employee.IBAN) ? MaskIBAN(employee.IBAN) : null,
            EmergencyContactName = employee.EmergencyContactName,
            EmergencyContactPhone = employee.EmergencyContactPhone,
            EmergencyContactRelation = employee.EmergencyContactRelation,
            IsActive = !employee.IsDeleted,
            CreatedAt = employee.CreatedDate,
            UpdatedAt = employee.UpdatedDate
        };

        return Result<EmployeeDto>.Success(employeeDto);
    }

    private static string MaskIBAN(string iban)
    {
        if (string.IsNullOrEmpty(iban) || iban.Length <= 8)
            return iban;

        return iban.Substring(0, 4) + new string('*', iban.Length - 8) + iban.Substring(iban.Length - 4);
    }
}
