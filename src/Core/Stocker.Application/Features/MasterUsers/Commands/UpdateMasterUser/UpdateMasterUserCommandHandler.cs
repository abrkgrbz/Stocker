using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.UpdateMasterUser;

public class UpdateMasterUserCommandHandler : IRequestHandler<UpdateMasterUserCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateMasterUserCommandHandler> _logger;

    public UpdateMasterUserCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<UpdateMasterUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(UpdateMasterUserCommand request, CancellationToken cancellationToken)
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

            // Check if new email already exists
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email.Value)
            {
                var existingUser = await _unitOfWork.MasterUsers()
                    .AsQueryable()
                    .Where(u => u.Email.Value == request.Email && u.Id != request.UserId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (existingUser != null)
                {
                    return Result<bool>.Failure(
                        Error.Conflict("MasterUser.EmailExists", "Bu e-posta adresi zaten kullanımda"));
                }
                
                // TODO: Add UpdateEmail method to MasterUser entity
                // user.UpdateEmail(request.Email);
            }

            // TODO: Add update methods to MasterUser entity
            // Update user properties
            // if (!string.IsNullOrEmpty(request.FirstName))
            // {
            //     user.UpdateFirstName(request.FirstName);
            // }

            // if (!string.IsNullOrEmpty(request.LastName))
            // {
            //     user.UpdateLastName(request.LastName);
            // }

            // if (!string.IsNullOrEmpty(request.Phone))
            // {
            //     user.UpdatePhone(request.Phone);
            // }

            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Master user {UserId} updated successfully by {ModifiedBy}", 
                request.UserId, request.ModifiedBy);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating master user {UserId}", request.UserId);
            return Result<bool>.Failure(
                Error.Failure("MasterUser.UpdateFailed", "Kullanıcı güncelleme işlemi başarısız oldu"));
        }
    }
}