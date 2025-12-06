using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

/// <summary>
/// Command to update a work location
/// </summary>
public class UpdateWorkLocationCommand : IRequest<Result<WorkLocationDto>>
{
    public Guid TenantId { get; set; }
    public int WorkLocationId { get; set; }
    public UpdateWorkLocationDto LocationData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateWorkLocationCommand
/// </summary>
public class UpdateWorkLocationCommandValidator : AbstractValidator<UpdateWorkLocationCommand>
{
    public UpdateWorkLocationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.WorkLocationId)
            .GreaterThan(0).WithMessage("Work location ID must be greater than 0");

        RuleFor(x => x.LocationData)
            .NotNull().WithMessage("Location data is required");

        When(x => x.LocationData != null, () =>
        {
            RuleFor(x => x.LocationData.Name)
                .NotEmpty().WithMessage("Location name is required")
                .MaximumLength(200).WithMessage("Location name must not exceed 200 characters");

            RuleFor(x => x.LocationData.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

            RuleFor(x => x.LocationData.Phone)
                .MaximumLength(20).WithMessage("Phone must not exceed 20 characters");

            RuleFor(x => x.LocationData.Email)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.LocationData.Email))
                .WithMessage("Invalid email address format");

            RuleFor(x => x.LocationData.Latitude)
                .InclusiveBetween(-90, 90).When(x => x.LocationData.Latitude.HasValue)
                .WithMessage("Latitude must be between -90 and 90");

            RuleFor(x => x.LocationData.Longitude)
                .InclusiveBetween(-180, 180).When(x => x.LocationData.Longitude.HasValue)
                .WithMessage("Longitude must be between -180 and 180");

            RuleFor(x => x.LocationData.GeofenceRadiusMeters)
                .GreaterThan(0).When(x => x.LocationData.GeofenceRadiusMeters.HasValue)
                .WithMessage("Geofence radius must be greater than 0");

            RuleFor(x => x.LocationData.Capacity)
                .GreaterThan(0).When(x => x.LocationData.Capacity.HasValue)
                .WithMessage("Capacity must be greater than 0");
        });
    }
}

/// <summary>
/// Handler for UpdateWorkLocationCommand
/// </summary>
public class UpdateWorkLocationCommandHandler : IRequestHandler<UpdateWorkLocationCommand, Result<WorkLocationDto>>
{
    private readonly IWorkLocationRepository _workLocationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWorkLocationCommandHandler(
        IWorkLocationRepository workLocationRepository,
        IUnitOfWork unitOfWork)
    {
        _workLocationRepository = workLocationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkLocationDto>> Handle(UpdateWorkLocationCommand request, CancellationToken cancellationToken)
    {
        // Get existing work location
        var workLocation = await _workLocationRepository.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
        {
            return Result<WorkLocationDto>.Failure(
                Error.NotFound("WorkLocation", $"Work location with ID {request.WorkLocationId} not found"));
        }

        // If marking as headquarters, check if another one already exists
        if (request.LocationData.IsHeadquarters && !workLocation.IsHeadquarters)
        {
            var existingHeadquarters = await _workLocationRepository.GetHeadquartersAsync(cancellationToken);
            if (existingHeadquarters != null && existingHeadquarters.Id != request.WorkLocationId)
            {
                return Result<WorkLocationDto>.Failure(
                    Error.Conflict("WorkLocation.IsHeadquarters",
                        $"A headquarters location already exists: {existingHeadquarters.Name}. Only one headquarters is allowed."));
            }
        }

        // Update basic properties
        workLocation.Update(
            request.LocationData.Name,
            request.LocationData.Description,
            request.LocationData.Phone,
            request.LocationData.Email,
            request.LocationData.Capacity);

        // Update address if provided
        if (!string.IsNullOrWhiteSpace(request.LocationData.Street) &&
            !string.IsNullOrWhiteSpace(request.LocationData.City) &&
            !string.IsNullOrWhiteSpace(request.LocationData.Country))
        {
            var address = Address.Create(
                request.LocationData.Street,
                request.LocationData.City,
                request.LocationData.Country,
                request.LocationData.PostalCode,
                state: request.LocationData.State);

            workLocation.SetAddress(address);
        }
        else
        {
            workLocation.SetAddress(null);
        }

        // Update geolocation
        if (request.LocationData.Latitude.HasValue && request.LocationData.Longitude.HasValue)
        {
            workLocation.SetGeolocation(
                request.LocationData.Latitude,
                request.LocationData.Longitude,
                request.LocationData.GeofenceRadiusMeters);
        }
        else
        {
            workLocation.SetGeolocation(null, null, null);
        }

        // Update timezone
        workLocation.SetTimeZone(request.LocationData.TimeZone);

        // Update headquarters status
        workLocation.SetAsHeadquarters(request.LocationData.IsHeadquarters);

        // Update remote status
        workLocation.SetAsRemote(request.LocationData.IsRemote);

        // Save changes
        _workLocationRepository.Update(workLocation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
