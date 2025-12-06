using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

/// <summary>
/// Command to create a new work location
/// </summary>
public class CreateWorkLocationCommand : IRequest<Result<WorkLocationDto>>
{
    public Guid TenantId { get; set; }
    public CreateWorkLocationDto LocationData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateWorkLocationCommand
/// </summary>
public class CreateWorkLocationCommandValidator : AbstractValidator<CreateWorkLocationCommand>
{
    public CreateWorkLocationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LocationData)
            .NotNull().WithMessage("Location data is required");

        When(x => x.LocationData != null, () =>
        {
            RuleFor(x => x.LocationData.Code)
                .NotEmpty().WithMessage("Location code is required")
                .MaximumLength(50).WithMessage("Location code must not exceed 50 characters");

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
/// Handler for CreateWorkLocationCommand
/// </summary>
public class CreateWorkLocationCommandHandler : IRequestHandler<CreateWorkLocationCommand, Result<WorkLocationDto>>
{
    private readonly IWorkLocationRepository _workLocationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateWorkLocationCommandHandler(
        IWorkLocationRepository workLocationRepository,
        IUnitOfWork unitOfWork)
    {
        _workLocationRepository = workLocationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<WorkLocationDto>> Handle(CreateWorkLocationCommand request, CancellationToken cancellationToken)
    {
        // Check if location with same code already exists
        var existingLocation = await _workLocationRepository.GetByCodeAsync(request.LocationData.Code, cancellationToken);
        if (existingLocation != null)
        {
            return Result<WorkLocationDto>.Failure(
                Error.Conflict("WorkLocation.Code", "A work location with this code already exists"));
        }

        // If marking as headquarters, check if one already exists
        if (request.LocationData.IsHeadquarters)
        {
            var existingHeadquarters = await _workLocationRepository.GetHeadquartersAsync(cancellationToken);
            if (existingHeadquarters != null)
            {
                return Result<WorkLocationDto>.Failure(
                    Error.Conflict("WorkLocation.IsHeadquarters",
                        $"A headquarters location already exists: {existingHeadquarters.Name}. Only one headquarters is allowed."));
            }
        }

        // Create the work location
        var workLocation = new WorkLocation(
            request.LocationData.Code,
            request.LocationData.Name,
            request.LocationData.Description,
            request.LocationData.IsHeadquarters);

        // Set tenant ID
        workLocation.SetTenantId(request.TenantId);

        // Set address if provided
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

        // Update additional properties
        workLocation.Update(
            request.LocationData.Name,
            request.LocationData.Description,
            request.LocationData.Phone,
            request.LocationData.Email,
            request.LocationData.Capacity);

        // Set geolocation if provided
        if (request.LocationData.Latitude.HasValue && request.LocationData.Longitude.HasValue)
        {
            workLocation.SetGeolocation(
                request.LocationData.Latitude,
                request.LocationData.Longitude,
                request.LocationData.GeofenceRadiusMeters);
        }

        // Set timezone
        if (!string.IsNullOrWhiteSpace(request.LocationData.TimeZone))
        {
            workLocation.SetTimeZone(request.LocationData.TimeZone);
        }

        // Set remote flag
        if (request.LocationData.IsRemote)
        {
            workLocation.SetAsRemote(true);
        }

        // Save to repository
        await _workLocationRepository.AddAsync(workLocation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            EmployeeCount = 0
        };

        return Result<WorkLocationDto>.Success(locationDto);
    }
}
