using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Features.Tenant.Modules.Commands;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Application.Features.Tenant.Modules.Handlers;

public class ToggleModuleCommandHandler : IRequestHandler<ToggleModuleCommand, bool>
{
    private readonly ITenantDbContext _context;

    public ToggleModuleCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await _context.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == request.TenantId && m.ModuleCode == request.ModuleCode, 
                cancellationToken);

        if (module == null)
            return false;

        if (request.Enable)
        {
            module.Enable();
        }
        else
        {
            module.Disable();
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}