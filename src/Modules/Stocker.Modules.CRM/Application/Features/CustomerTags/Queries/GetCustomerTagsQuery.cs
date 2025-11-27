using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;

public class GetCustomerTagsQuery : IRequest<Result<List<CustomerTagDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
}

public class GetCustomerTagsQueryValidator : AbstractValidator<GetCustomerTagsQuery>
{
    public GetCustomerTagsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}

public class GetCustomerTagsQueryHandler : IRequestHandler<GetCustomerTagsQuery, Result<List<CustomerTagDto>>>
{
    private readonly CRMDbContext _context;

    public GetCustomerTagsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CustomerTagDto>>> Handle(GetCustomerTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _context.CustomerTags
            .Where(t => t.CustomerId == request.CustomerId && t.TenantId == request.TenantId)
            .Select(t => new CustomerTagDto
            {
                Id = t.Id,
                TenantId = t.TenantId,
                CustomerId = t.CustomerId,
                Tag = t.Tag,
                Color = t.Color,
                CreatedBy = t.CreatedBy
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerTagDto>>.Success(tags);
    }
}
