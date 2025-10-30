using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenant.Roles.Commands;

namespace Stocker.Application.Features.Tenant.Roles.Handlers;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly ITenantDbContextFactory _contextFactory;

    public DeleteRoleCommandHandler(ITenantDbContextFactory contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        await using var context = _contextFactory.CreateDbContext(request.TenantId);

        var role = await context.Roles
            .Include(r => r.Permissions)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role == null)
        {
            return false;
        }

        // Check if role has users assigned
        var hasUsers = await context.UserRoles
            .AnyAsync(ur => ur.RoleId == request.RoleId, cancellationToken);

        if (hasUsers)
        {
            throw new InvalidOperationException("Cannot delete role that has users assigned to it.");
        }

        // Remove role (cascade will remove permissions)
        context.Roles.Remove(role);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
