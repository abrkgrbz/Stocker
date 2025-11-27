using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class GetDistinctTagsQueryHandler : IRequestHandler<GetDistinctTagsQuery, Result<List<string>>>
{
    private readonly CRMDbContext _context;

    public GetDistinctTagsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<string>>> Handle(GetDistinctTagsQuery request, CancellationToken cancellationToken)
    {
        var distinctTags = await _context.CustomerTags
            .Where(t => t.TenantId == request.TenantId)
            .Select(t => t.Tag)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Success(distinctTags);
    }
}
