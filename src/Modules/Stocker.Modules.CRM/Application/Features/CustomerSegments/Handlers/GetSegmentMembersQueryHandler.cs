using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class GetSegmentMembersQueryHandler : IRequestHandler<GetSegmentMembersQuery, Result<List<CustomerSegmentMemberDto>>>
{
    private readonly CRMDbContext _context;

    public GetSegmentMembersQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CustomerSegmentMemberDto>>> Handle(GetSegmentMembersQuery request, CancellationToken cancellationToken)
    {
        var segmentExists = await _context.CustomerSegments
            .AnyAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (!segmentExists)
        {
            return Result<List<CustomerSegmentMemberDto>>.Failure(
                Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        var members = await _context.CustomerSegmentMembers
            .Where(m => m.SegmentId == request.SegmentId && m.TenantId == request.TenantId)
            .Join(_context.Customers,
                member => member.CustomerId,
                customer => customer.Id,
                (member, customer) => new CustomerSegmentMemberDto
                {
                    Id = member.Id,
                    SegmentId = member.SegmentId,
                    CustomerId = member.CustomerId,
                    AddedAt = member.AddedAt,
                    Reason = member.Reason,
                    CustomerName = customer.CompanyName,
                    CustomerEmail = customer.Email
                })
            .OrderBy(m => m.AddedAt)
            .ToListAsync(cancellationToken);

        return Result<List<CustomerSegmentMemberDto>>.Success(members);
    }
}
