using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetSegmentMembersQuery : IRequest<Result<List<CustomerSegmentMemberDto>>>
{
    public Guid SegmentId { get; set; }
}

public class GetSegmentMembersQueryValidator : AbstractValidator<GetSegmentMembersQuery>
{
    public GetSegmentMembersQueryValidator()
    {
        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetSegmentMembersQueryHandler : IRequestHandler<GetSegmentMembersQuery, Result<List<CustomerSegmentMemberDto>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetSegmentMembersQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CustomerSegmentMemberDto>>> Handle(GetSegmentMembersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        // Verify segment exists
        var segmentExists = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .AnyAsync(s => s.Id == request.SegmentId && s.TenantId == tenantId, cancellationToken);

        if (!segmentExists)
        {
            return Result<List<CustomerSegmentMemberDto>>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        var members = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegmentMember>().AsQueryable()
            .Include(m => m.Customer)
            .Where(m => m.SegmentId == request.SegmentId && m.TenantId == tenantId)
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
