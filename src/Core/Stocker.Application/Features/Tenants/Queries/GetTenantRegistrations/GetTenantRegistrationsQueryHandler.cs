using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantRegistrations;

public class GetTenantRegistrationsQueryHandler : IRequestHandler<GetTenantRegistrationsQuery, Result<List<TenantRegistrationDto>>>
{
    private readonly IMasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTenantRegistrationsQueryHandler> _logger;

    public GetTenantRegistrationsQueryHandler(
        IMasterDbContext context,
        IMapper mapper,
        ILogger<GetTenantRegistrationsQueryHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<TenantRegistrationDto>>> Handle(GetTenantRegistrationsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.TenantRegistrations.AsQueryable();

            // Apply status filter
            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                if (Enum.TryParse<RegistrationStatus>(request.Status, out var status))
                {
                    query = query.Where(r => r.Status == status);
                }
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(r =>
                    r.CompanyName.ToLower().Contains(searchTerm) ||
                    r.CompanyCode.ToLower().Contains(searchTerm) ||
                    r.ContactEmail.Value.ToLower().Contains(searchTerm) ||
                    r.AdminEmail.Value.ToLower().Contains(searchTerm) ||
                    r.RegistrationCode.ToLower().Contains(searchTerm));
            }

            // Order by registration date (newest first)
            query = query.OrderByDescending(r => r.RegistrationDate);

            // Apply pagination
            var registrations = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<TenantRegistrationDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} tenant registrations", registrations.Count);

            return Result<List<TenantRegistrationDto>>.Success(registrations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenant registrations");
            return Result<List<TenantRegistrationDto>>.Failure(
                Error.Failure("TenantRegistrations.QueryError", "Failed to retrieve tenant registrations"));
        }
    }
}
