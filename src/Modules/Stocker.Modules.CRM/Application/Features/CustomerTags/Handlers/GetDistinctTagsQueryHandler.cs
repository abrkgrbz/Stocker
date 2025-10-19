using MediatR;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Handlers;

public class GetDistinctTagsQueryHandler : IRequestHandler<GetDistinctTagsQuery, Result<List<string>>>
{
    private readonly ICustomerTagRepository _tagRepository;

    public GetDistinctTagsQueryHandler(ICustomerTagRepository tagRepository)
    {
        _tagRepository = tagRepository;
    }

    public async Task<Result<List<string>>> Handle(GetDistinctTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _tagRepository.GetDistinctTagsAsync(request.TenantId, cancellationToken);
        return Result<List<string>>.Success(tags);
    }
}
