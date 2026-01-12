using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public class DeleteSocialMediaProfileCommandHandler : IRequestHandler<DeleteSocialMediaProfileCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteSocialMediaProfileCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSocialMediaProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.SocialMediaProfiles.GetByIdAsync(request.Id, cancellationToken);

        if (profile == null)
            return Result<bool>.Failure(Error.NotFound("SocialMediaProfile.NotFound", "Social media profile not found"));

        if (profile.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SocialMediaProfile.Forbidden", "Access denied"));

        await _unitOfWork.SocialMediaProfiles.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
