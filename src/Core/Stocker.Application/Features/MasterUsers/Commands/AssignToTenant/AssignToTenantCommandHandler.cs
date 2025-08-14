using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.AssignToTenant;

public class AssignToTenantCommandHandler : IRequestHandler<AssignToTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<AssignToTenantCommandHandler> _logger;

    public AssignToTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<AssignToTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(AssignToTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .Include(u => u.UserTenants)
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            var tenant = await _unitOfWork.Tenants()
                .GetByIdAsync(request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Tenant.NotFound", "Tenant bulunamadı"));
            }

            // Check if user is already assigned to this tenant
            if (user.UserTenants.Any(ut => ut.TenantId == request.TenantId))
            {
                return Result<bool>.Failure(
                    Error.Conflict("MasterUser.AlreadyAssigned", "Kullanıcı zaten bu tenant'a atanmış"));
            }

            // Assign user to tenant
            user.AssignToTenant(request.TenantId, request.Role);

            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} assigned to tenant {TenantId} with role {Role} by {AssignedBy}", 
                request.UserId, request.TenantId, request.Role, request.AssignedBy);

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
}