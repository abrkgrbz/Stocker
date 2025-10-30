using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenant.Roles.Commands;
using Stocker.Domain.Tenant.Enums;

namespace Stocker.Application.Features.Tenant.Roles.Handlers;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, bool>
{
    private readonly ITenantDbContextFactory _contextFactory;

    public UpdateRoleCommandHandler(ITenantDbContextFactory contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<bool> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        await using var context = _contextFactory.CreateDbContext(request.TenantId);

        var role = await context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role == null)
        {
            return false;
        }

        // Update basic info
        role.Update(request.Name, request.Description);

        // Clear existing permissions and add new ones
        role.ClearPermissions();
        foreach (var permission in request.Permissions)
        {
            role.AddPermission(permission.Resource, (PermissionType)permission.PermissionType);
        }

        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
