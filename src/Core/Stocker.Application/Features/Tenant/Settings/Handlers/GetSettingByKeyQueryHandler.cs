using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Queries;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class GetSettingByKeyQueryHandler : IRequestHandler<GetSettingByKeyQuery, SettingDto?>
{
    private readonly TenantDbContext _context;
    private readonly IMapper _mapper;

    public GetSettingByKeyQueryHandler(TenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SettingDto?> Handle(GetSettingByKeyQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.TenantSettings
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId && s.SettingKey == request.SettingKey, 
                cancellationToken);

        if (setting == null)
            return null;

        return _mapper.Map<SettingDto>(setting);
    }
}