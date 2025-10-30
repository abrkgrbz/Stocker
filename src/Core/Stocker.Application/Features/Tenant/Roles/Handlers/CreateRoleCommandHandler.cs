using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Roles.Commands;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;

namespace Stocker.Application.Features.Tenant.Roles.Handlers;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, RoleDto>
{
    private readonly ITenantDbContextFactory _contextFactory;

    public CreateRoleCommandHandler(ITenantDbContextFactory contextFactory)
    {
        _contextFactory = contextFactory;
    }

    public async Task<RoleDto> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        await using var context = _contextFactory.CreateDbContext(request.TenantId);

        // Check if role name already exists
        var existingRole = await context.Roles
            .FirstOrDefaultAsync(r => r.Name == request.Name, cancellationToken);

        if (existingRole != null)
        {
            throw new InvalidOperationException($"Role with name '{request.Name}' already exists.");
        }

        // Create new role
        var role = Role.Create(request.Name, request.Description, isSystemRole: false);

        // Add permissions
        foreach (var permission in request.Permissions)
        {
            role.AddPermission(permission.Resource, (PermissionType)permission.PermissionType);
        }

        context.Roles.Add(role);
        await context.SaveChangesAsync(cancellationToken);

        // Get user count for this role (will be 0 for new role)
        var userCount = await context.UserRoles
            .CountAsync(ur => ur.RoleId == role.Id, cancellationToken);

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            Permissions = role.Permissions
                .Select(p => $"{p.Resource}:{p.PermissionType}")
                .ToList(),
            UserCount = userCount,
            IsSystemRole = role.IsSystemRole,
            CreatedDate = role.CreatedAt
        };
    }
}
