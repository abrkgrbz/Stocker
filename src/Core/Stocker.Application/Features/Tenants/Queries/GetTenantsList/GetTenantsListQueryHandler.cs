using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantsList;

public class GetTenantsListQueryHandler : IRequestHandler<GetTenantsListQuery, Result<List<TenantListDto>>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTenantsListQueryHandler> _logger;

    public GetTenantsListQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetTenantsListQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<TenantListDto>>> Handle(GetTenantsListQuery request, CancellationToken cancellationToken)
    {
        try
        {
            IQueryable<Domain.Master.Entities.Tenant> query = _unitOfWork.Tenants()
                .AsQueryable()
                .Include(t => t.Domains)
                .Include(t => t.Subscriptions)
                    .ThenInclude(s => s.Package);

            // Apply filters
            if (request.IsActive.HasValue)
            {
                query = query.Where(t => t.IsActive == request.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(t => 
                    t.Name.ToLower().Contains(searchTerm) ||
                    t.Code.ToLower().Contains(searchTerm) ||
                    t.Domains.Any(d => d.DomainName.ToLower().Contains(searchTerm)));
            }

            // Apply pagination
            var totalCount = await query.CountAsync(cancellationToken);
            
            var tenants = await query
                .OrderBy(t => t.Name)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<TenantListDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<TenantListDto>>.Success(tenants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenants list");
            return Result<List<TenantListDto>>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }
}