using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Handlers;

public class GetCustomerTagsQueryHandler : IRequestHandler<GetCustomerTagsQuery, Result<List<CustomerTagDto>>>
{
    private readonly ICustomerTagRepository _tagRepository;

    public GetCustomerTagsQueryHandler(ICustomerTagRepository tagRepository)
    {
        _tagRepository = tagRepository;
    }

    public async Task<Result<List<CustomerTagDto>>> Handle(GetCustomerTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _tagRepository.GetByCustomerAsync(request.CustomerId, cancellationToken);

        var dtos = tags.Select(tag => new CustomerTagDto
        {
            Id = tag.Id,
            TenantId = tag.TenantId,
            CustomerId = tag.CustomerId,
            Tag = tag.Tag,
            Color = tag.Color,
            CreatedBy = tag.CreatedBy,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        return Result<List<CustomerTagDto>>.Success(dtos);
    }
}
