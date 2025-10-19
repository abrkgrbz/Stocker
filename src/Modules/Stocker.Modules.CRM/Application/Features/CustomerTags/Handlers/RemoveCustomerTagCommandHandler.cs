using MediatR;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Handlers;

public class RemoveCustomerTagCommandHandler : IRequestHandler<RemoveCustomerTagCommand, Result>
{
    private readonly ICustomerTagRepository _tagRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveCustomerTagCommandHandler(
        ICustomerTagRepository tagRepository,
        IUnitOfWork unitOfWork)
    {
        _tagRepository = tagRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveCustomerTagCommand request, CancellationToken cancellationToken)
    {
        var tag = await _tagRepository.GetByIdAsync(request.Id, cancellationToken);

        if (tag == null || tag.TenantId != request.TenantId)
        {
            return Result.Failure(Error.NotFound("CustomerTag.NotFound", "Customer tag not found"));
        }

        _tagRepository.Remove(tag);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
