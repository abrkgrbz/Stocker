using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetCustomerSegmentsQuery : IRequest<Result<List<CustomerSegmentDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool? IsActive { get; set; }
}

public class GetCustomerSegmentsQueryValidator : AbstractValidator<GetCustomerSegmentsQuery>
{
    public GetCustomerSegmentsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");
    }
}

public class GetCustomerSegmentsQueryHandler : IRequestHandler<GetCustomerSegmentsQuery, Result<List<CustomerSegmentDto>>>
{
    private readonly CRMDbContext _context;

    public GetCustomerSegmentsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CustomerSegmentDto>>> Handle(GetCustomerSegmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CustomerSegments
            .Where(s => s.TenantId == request.TenantId);

        if (request.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == request.IsActive.Value);
        }

        var segments = await query
            .Select(s => new CustomerSegmentDto
            {
                Id = s.Id,
                TenantId = s.TenantId,
                Name = s.Name,
                Description = s.Description,
                Type = s.Type,
                Criteria = s.Criteria,
                Color = s.Color,
                IsActive = s.IsActive,
                MemberCount = s.MemberCount,
                CreatedBy = s.CreatedBy,
                LastModifiedBy = s.LastModifiedBy
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerSegmentDto>>.Success(segments);
    }
}
