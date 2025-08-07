using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantById;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, Result<TenantDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTenantByIdQueryHandler> _logger;

    public GetTenantByIdQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetTenantByIdQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<TenantDto>> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var tenant = await _unitOfWork.Tenants()
                .AsQueryable()
                .Include(t => t.Domains)
                .Include(t => t.Subscriptions)
                    .ThenInclude(s => s.Package)
                .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (tenant == null)
            {
                return Result<TenantDto>.Failure(DomainErrors.Tenant.NotFound(request.Id));
            }

            var tenantDto = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(tenantDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenant with ID: {TenantId}", request.Id);
            return Result<TenantDto>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }
}