using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Features.Tenant.Settings.Commands;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand, bool>
{
    private readonly ITenantDbContext _context;

    public UpdateSettingCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.TenantSettings
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId && s.SettingKey == request.SettingKey, 
                cancellationToken);

        if (setting == null)
            return false;

        setting.UpdateValue(request.SettingValue);
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}