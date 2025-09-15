using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Modules;
using Stocker.Application.Features.Tenant.Modules.Queries;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Tenant.Modules.Handlers;

public class GetModulesQueryHandler : IRequestHandler<GetModulesQuery, List<ModuleDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetModulesQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ModuleDto>> Handle(GetModulesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TenantModules
            .Where(m => m.TenantId == request.TenantId);

        if (request.IsEnabled.HasValue)
        {
            query = query.Where(m => m.IsEnabled == request.IsEnabled.Value);
        }

        var modules = await query
            .OrderBy(m => m.ModuleName)
            .ToListAsync(cancellationToken);

        var moduleDtos = _mapper.Map<List<ModuleDto>>(modules);
        
        // Set IsExpired flag
        foreach (var moduleDto in moduleDtos)
        {
            moduleDto.IsExpired = moduleDto.ExpiryDate.HasValue && moduleDto.ExpiryDate.Value < DateTime.UtcNow;
        }

        return moduleDtos;
    }
}