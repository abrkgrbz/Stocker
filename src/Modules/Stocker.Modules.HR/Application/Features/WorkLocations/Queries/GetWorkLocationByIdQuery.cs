using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Queries;

/// <summary>
/// Query to get a work location by ID
/// </summary>
public record GetWorkLocationByIdQuery(int WorkLocationId) : IRequest<Result<WorkLocationDto>>;

/// <summary>
/// Validator for GetWorkLocationByIdQuery
/// </summary>
public class GetWorkLocationByIdQueryValidator : AbstractValidator<GetWorkLocationByIdQuery>
{
    public GetWorkLocationByIdQueryValidator()
    {
        RuleFor(x => x.WorkLocationId)
            .GreaterThan(0).WithMessage("Work location ID must be greater than 0");
    }
}

/// <summary>
/// Handler for GetWorkLocationByIdQuery
/// </summary>
public class GetWorkLocationByIdQueryHandler : IRequestHandler<GetWorkLocationByIdQuery, Result<WorkLocationDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetWorkLocationByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkLocationDto>> Handle(GetWorkLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
        {
            return Result<WorkLocationDto>.Failure(
                Error.NotFound("WorkLocation", $"Work location with ID {request.WorkLocationId} not found"));
        }

        // Get employee count
        var employeeCount = await _unitOfWork.WorkLocations.GetEmployeeCountAsync(workLocation.Id, cancellationToken);

        // Map to DTO
        var locationDto = new WorkLocationDto
        {
            Id = workLocation.Id,
            Code = workLocation.Code,
            Name = workLocation.Name,
            Description = workLocation.Description,
            Street = workLocation.Address?.Street,
            City = workLocation.Address?.City,
            State = workLocation.Address?.State,
            PostalCode = workLocation.Address?.PostalCode,
            Country = workLocation.Address?.Country,
            Phone = workLocation.Phone,
            Email = workLocation.Email,
            Latitude = workLocation.Latitude,
            Longitude = workLocation.Longitude,
            GeofenceRadiusMeters = workLocation.GeofenceRadiusMeters,
            TimeZone = workLocation.TimeZone,
            IsHeadquarters = workLocation.IsHeadquarters,
            IsRemote = workLocation.IsRemote,
            Capacity = workLocation.Capacity,
            IsActive = workLocation.IsActive,
            CreatedAt = workLocation.CreatedDate,
            UpdatedAt = workLocation.UpdatedDate,
            EmployeeCount = employeeCount
        };

        return Result<WorkLocationDto>.Success(locationDto);
    }
}
