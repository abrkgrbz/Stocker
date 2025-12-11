using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Commands;

public class DeleteSocialMediaProfileCommandHandler : IRequestHandler<DeleteSocialMediaProfileCommand, Result<bool>>
{
    private readonly ISocialMediaProfileRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteSocialMediaProfileCommandHandler(
        ISocialMediaProfileRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteSocialMediaProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (profile == null)
            return Result<bool>.Failure(Error.NotFound("SocialMediaProfile.NotFound", "Social media profile not found"));

        if (profile.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SocialMediaProfile.Forbidden", "Access denied"));

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
