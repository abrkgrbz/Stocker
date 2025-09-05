using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, List<SettingCategoryDto>>
{
    private readonly TenantDbContext _context;
    private readonly IMapper _mapper;

    public GetSettingsQueryHandler(TenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SettingCategoryDto>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TenantSettings
            .Where(s => s.TenantId == request.TenantId);

        if (!request.IncludeSystemSettings)
        {
            query = query.Where(s => !s.IsSystemSetting);
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(s => s.Category == request.Category);
        }

        var settings = await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.SettingKey)
            .ToListAsync(cancellationToken);

        var groupedSettings = settings
            .GroupBy(s => s.Category)
            .Select(g => new SettingCategoryDto
            {
                Category = g.Key,
                Settings = _mapper.Map<List<SettingDto>>(g.ToList())
            })
            .ToList();

        return groupedSettings;
    }
}