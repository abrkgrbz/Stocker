using FluentValidation;
using MediatR;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;

public class GetDistinctTagsQuery : IRequest<Result<List<string>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

public class GetDistinctTagsQueryValidator : AbstractValidator<GetDistinctTagsQuery>
{
    public GetDistinctTagsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");
    }
}
