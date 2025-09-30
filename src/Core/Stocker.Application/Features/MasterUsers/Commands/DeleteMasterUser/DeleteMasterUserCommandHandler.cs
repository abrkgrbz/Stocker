using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.DeleteMasterUser;

public class DeleteMasterUserCommandHandler : IRequestHandler<DeleteMasterUserCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteMasterUserCommandHandler> _logger;

    public DeleteMasterUserCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<DeleteMasterUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteMasterUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            // TODO: Add IsSystemAdmin support to MasterUser entity
            // Check if user is system admin
            // if (user.IsSystemAdmin)
            // {
            //     // Check if there are other system admins
            //     var otherAdmins = await _unitOfWork.MasterUsers()
            //         .AsQueryable()
            //         .CountAsync(u => u.IsSystemAdmin && u.Id != request.UserId, cancellationToken);

            //     if (otherAdmins == 0)
            //     {
            //         return Result<bool>.Failure(
            //             Error.Conflict("MasterUser.LastSystemAdmin", 
            //                 "Son sistem yöneticisi silinemez. Önce başka bir yönetici atayın."));
            //     }
            // }

            // UserTenant has been moved to Tenant domain
            // Tenant associations need to be handled through Tenant database context
            _logger.LogWarning("UserTenant management has been moved to Tenant domain. Manual cleanup may be required for user {UserId}", request.UserId);

            // Soft delete - just deactivate
            user.Deactivate();
            
            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Master user {UserId} ({Username}) has been deleted", 
                user.Id, user.Username);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting master user {UserId}", request.UserId);
            return Result<bool>.Failure(
                Error.Failure("MasterUser.DeleteFailed", "Kullanıcı silme işlemi başarısız oldu"));
        }
    }
}