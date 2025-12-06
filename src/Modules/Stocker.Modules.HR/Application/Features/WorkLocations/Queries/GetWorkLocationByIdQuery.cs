using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Queries;

/// <summary>
/// Query to get a work location by ID
/// </summary>
public class GetWorkLocationByIdQuery : IRequest<Result<WorkLocationDto>>
{
    public Guid TenantId { get; set; }
    public int WorkLocationId { get; set; }
}

/// <summary>
/// Handler for GetWorkLocationByIdQuery
/// </summary>
public class GetWorkLocationByIdQueryHandler : IRequestHandler<GetWorkLocationByIdQuery, Result<WorkLocationDto>>
{
    private readonly IWorkLocationRepository _workLocationRepository;

    public GetWorkLocationByIdQueryHandler(IWorkLocationRepository workLocationRepository)
    {
        _workLocationRepository = workLocationRepository;
    }

    public async Task<Result<WorkLocationDto>> Handle(GetWorkLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var workLocation = await _workLocationRepository.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
        {
            return Result<WorkLocationDto>.Failure(
                Error.NotFound("WorkLocation", $"Work location with ID {request.WorkLocationId} not found"));
        }

        // Get employee count
        var employeeCount = await _workLocationRepository.GetEmployeeCountAsync(workLocation.Id, cancellationToken);

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
