using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Queries;

/// <summary>
/// Query to get work locations with filters
/// </summary>
public class GetWorkLocationsQuery : IRequest<Result<List<WorkLocationDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public bool? OnlyHeadquarters { get; set; }
    public bool? OnlyRemote { get; set; }
    public bool? OnlyWithGeofencing { get; set; }
}

/// <summary>
/// Handler for GetWorkLocationsQuery
/// </summary>
public class GetWorkLocationsQueryHandler : IRequestHandler<GetWorkLocationsQuery, Result<List<WorkLocationDto>>>
{
    private readonly IWorkLocationRepository _workLocationRepository;

    public GetWorkLocationsQueryHandler(IWorkLocationRepository workLocationRepository)
    {
        _workLocationRepository = workLocationRepository;
    }

    public async Task<Result<List<WorkLocationDto>>> Handle(GetWorkLocationsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.WorkLocation> workLocations;

        // Apply specific filters
        if (request.OnlyHeadquarters == true)
        {
            var headquarters = await _workLocationRepository.GetHeadquartersAsync(cancellationToken);
            workLocations = headquarters != null ? new[] { headquarters } : Array.Empty<Domain.Entities.WorkLocation>();
        }
        else if (request.OnlyRemote == true)
        {
            workLocations = await _workLocationRepository.GetRemoteLocationsAsync(cancellationToken);
        }
        else if (request.OnlyWithGeofencing == true)
        {
            workLocations = await _workLocationRepository.GetWithGeofencingAsync(cancellationToken);
        }
        else
        {
            // Get all locations
            workLocations = request.IncludeInactive
                ? await _workLocationRepository.GetAllAsync(cancellationToken)
                : await _workLocationRepository.GetActiveAsync(cancellationToken);
        }

        // Filter by active status if needed
        if (!request.IncludeInactive && request.OnlyHeadquarters != true)
        {
            workLocations = workLocations.Where(wl => wl.IsActive).ToList();
        }

        // Map to DTOs
        var locationDtos = new List<WorkLocationDto>();
        foreach (var location in workLocations)
        {
            var employeeCount = await _workLocationRepository.GetEmployeeCountAsync(location.Id, cancellationToken);

            locationDtos.Add(new WorkLocationDto
            {
                Id = location.Id,
                Code = location.Code,
                Name = location.Name,
                Description = location.Description,
                Street = location.Address?.Street,
                City = location.Address?.City,
                State = location.Address?.State,
                PostalCode = location.Address?.PostalCode,
                Country = location.Address?.Country,
                Phone = location.Phone,
                Email = location.Email,
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                GeofenceRadiusMeters = location.GeofenceRadiusMeters,
                TimeZone = location.TimeZone,
                IsHeadquarters = location.IsHeadquarters,
                IsRemote = location.IsRemote,
                Capacity = location.Capacity,
                IsActive = location.IsActive,
                CreatedAt = location.CreatedDate,
                UpdatedAt = location.UpdatedDate,
                EmployeeCount = employeeCount
            });
        }

        return Result<List<WorkLocationDto>>.Success(locationDtos.OrderBy(l => l.Name).ToList());
    }
}
