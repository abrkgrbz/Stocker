using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.ToggleMasterUserStatus;

public class ToggleMasterUserStatusCommandHandler : IRequestHandler<ToggleMasterUserStatusCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<ToggleMasterUserStatusCommandHandler> _logger;

    public ToggleMasterUserStatusCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<ToggleMasterUserStatusCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(ToggleMasterUserStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _unitOfWork.MasterUsers()
                .GetByIdAsync(request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            bool newStatus;
            if (user.IsActive)
            {
                user.Deactivate();
                newStatus = false;
            }
            else
            {
                user.Activate();
                newStatus = true;
            }

            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Master user {UserId} status changed to {Status} by {ModifiedBy}", 
                request.UserId, newStatus ? "Active" : "Inactive", request.ModifiedBy);

            return Result<bool>.Success(newStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling master user {UserId} status", request.UserId);
            return Result<bool>.Failure(
                Error.Failure("MasterUser.ToggleStatusFailed", "Kullanıcı durumu değiştirme işlemi başarısız oldu"));
        }
    }
}