using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.AssignToTenant;

public class AssignToTenantCommandHandler : IRequestHandler<AssignToTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ITenantUnitOfWork _tenantUnitOfWork;
    private readonly ITenantContextFactory _tenantContextFactory;
    private readonly ILogger<AssignToTenantCommandHandler> _logger;

    public AssignToTenantCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantUnitOfWork tenantUnitOfWork,
        ITenantContextFactory tenantContextFactory,
        ILogger<AssignToTenantCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantUnitOfWork = tenantUnitOfWork;
        _tenantContextFactory = tenantContextFactory;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(AssignToTenantCommand request, CancellationToken cancellationToken)
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

            // Get tenant from Master DB
            var tenant = await _masterUnitOfWork.Tenants()
                .GetByIdAsync(request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Tenant.NotFound", "Tenant bulunamadı"));
            }

            // Switch to the target tenant's database context
            using (var tenantContext = await _tenantContextFactory.CreateAsync(request.TenantId))
            {
                // Check if user is already assigned to this tenant
                var existingUserTenant = await tenantContext.Set<UserTenant>()
                    .FirstOrDefaultAsync(ut => ut.UserId == request.UserId, cancellationToken);

                if (existingUserTenant != null)
                {
                    return Result<bool>.Failure(
                        Error.Conflict("MasterUser.AlreadyAssigned", "Kullanıcı zaten bu tenant'a atanmış"));
                }

                // Create UserTenant record in the tenant's database
                // Convert Master UserType to Tenant UserType
                var tenantUserType = ConvertToTenantUserType(request.UserType);
                
                var userTenant = UserTenant.Create(
                    userId: user.Id,
                    username: user.Username,
                    email: user.Email.Value,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    userType: tenantUserType,
                    assignedBy: request.AssignedBy ?? "System",
                    phoneNumber: user.PhoneNumber?.Value);

                await tenantContext.Set<UserTenant>().AddAsync(userTenant, cancellationToken);
                await tenantContext.SaveChangesAsync(cancellationToken);
            }

            // Update user's tenant assignment in Master DB
            user.AssignToTenant(request.TenantId, request.UserType);
            await _masterUnitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} assigned to tenant {TenantId} with role {UserType} by {AssignedBy}", 
                request.UserId, request.TenantId, request.UserType, request.AssignedBy);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning user {UserId} to tenant {TenantId}", 
                request.UserId, request.TenantId);
            return Result<bool>.Failure(
                Error.Failure("MasterUser.AssignFailed", "Kullanıcı atama işlemi başarısız oldu"));
        }
    }
    
    private Domain.Tenant.Entities.UserType ConvertToTenantUserType(Domain.Master.Enums.UserType masterUserType)
    {
        return masterUserType switch
        {
            Domain.Master.Enums.UserType.SistemYoneticisi => Domain.Tenant.Entities.UserType.SistemYoneticisi,
            Domain.Master.Enums.UserType.FirmaYoneticisi => Domain.Tenant.Entities.UserType.FirmaYoneticisi,
            Domain.Master.Enums.UserType.Personel => Domain.Tenant.Entities.UserType.Personel,
            Domain.Master.Enums.UserType.Destek => Domain.Tenant.Entities.UserType.Destek,
            Domain.Master.Enums.UserType.Misafir => Domain.Tenant.Entities.UserType.Misafir,
            _ => Domain.Tenant.Entities.UserType.Misafir
        };
    }
}