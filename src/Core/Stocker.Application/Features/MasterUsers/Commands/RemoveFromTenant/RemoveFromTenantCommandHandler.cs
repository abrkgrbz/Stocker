using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.RemoveFromTenant;

public class RemoveFromTenantCommandHandler : IRequestHandler<RemoveFromTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ITenantContextFactory _tenantContextFactory;
    private readonly ILogger<RemoveFromTenantCommandHandler> _logger;

    public RemoveFromTenantCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantContextFactory tenantContextFactory,
        ILogger<RemoveFromTenantCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantContextFactory = tenantContextFactory;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemoveFromTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get user from Master DB
            var user = await _masterUnitOfWork.MasterUsers()
                .AsQueryable()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            // Switch to the target tenant's database context
            using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
            {
                // Find and remove UserTenant record from tenant's database
                var userTenant = await tenantContext.Set<UserTenant>()
                    .FirstOrDefaultAsync(ut => ut.UserId == request.UserId, cancellationToken);

                if (userTenant == null)
                {
                    return Result<bool>.Failure(
                        Error.NotFound("MasterUser.NotAssigned", "Kullanıcı bu tenant'a atanmamış"));
                }

                // Deactivate the user in tenant (soft delete)
                userTenant.Deactivate(request.RemovedBy, "Removed from tenant");
                
                await tenantContext.SaveChangesAsync(cancellationToken);
            }

            // Remove user from tenant in Master DB
            user.RemoveFromTenant(request.TenantId);

            await _masterUnitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} removed from tenant {TenantId} by {RemovedBy}", 
                request.UserId, request.TenantId, request.RemovedBy);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from tenant {TenantId}", 
                request.UserId, request.TenantId);
            return Result<bool>.Failure(
                Error.Failure("MasterUser.RemoveFailed", "Kullanıcı kaldırma işlemi başarısız oldu"));
        }
    }
}