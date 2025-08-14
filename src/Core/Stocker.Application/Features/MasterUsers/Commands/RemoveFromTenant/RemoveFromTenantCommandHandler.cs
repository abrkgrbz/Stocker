using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.RemoveFromTenant;

public class RemoveFromTenantCommandHandler : IRequestHandler<RemoveFromTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveFromTenantCommandHandler> _logger;

    public RemoveFromTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<RemoveFromTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(RemoveFromTenantCommand request, CancellationToken cancellationToken)
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

            // Check if user is assigned to this tenant
            if (!user.UserTenants.Any(ut => ut.TenantId == request.TenantId))
            {
                return Result<bool>.Failure(
                    Error.NotFound("MasterUser.NotAssigned", "Kullanıcı bu tenant'a atanmamış"));
            }

            // Remove user from tenant
            user.RemoveFromTenant(request.TenantId);

            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

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