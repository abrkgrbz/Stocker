using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetSegmentMembersQuery : IRequest<Result<List<CustomerSegmentMemberDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid SegmentId { get; set; }
}

public class GetSegmentMembersQueryValidator : AbstractValidator<GetSegmentMembersQuery>
{
    public GetSegmentMembersQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

public class GetSegmentMembersQueryHandler : IRequestHandler<GetSegmentMembersQuery, Result<List<CustomerSegmentMemberDto>>>
{
    private readonly CRMDbContext _context;

    public GetSegmentMembersQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CustomerSegmentMemberDto>>> Handle(GetSegmentMembersQuery request, CancellationToken cancellationToken)
    {
        // Verify segment exists
        var segmentExists = await _context.CustomerSegments
            .AnyAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (!segmentExists)
        {
            return Result<List<CustomerSegmentMemberDto>>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        var members = await _context.CustomerSegmentMembers
            .Include(m => m.Customer)
            .Where(m => m.SegmentId == request.SegmentId && m.TenantId == request.TenantId)
            .Select(m => new CustomerSegmentMemberDto
            {
                Id = m.Id,
                SegmentId = m.SegmentId,
                CustomerId = m.CustomerId,
                AddedAt = m.AddedAt,
                Reason = m.Reason,
                CustomerName = m.Customer != null ? m.Customer.CompanyName : null,
                CustomerEmail = m.Customer != null ? m.Customer.Email : null
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerSegmentMemberDto>>.Success(members);
    }
}
