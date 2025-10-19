using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Application.Segmentation;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

/// <summary>
/// Handler for recalculating segment members based on dynamic criteria
/// </summary>
public class RecalculateSegmentMembersCommandHandler : IRequestHandler<RecalculateSegmentMembersCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;
    private readonly SegmentCriteriaEngine _criteriaEngine;

    public RecalculateSegmentMembersCommandHandler(
        CRMDbContext context,
        SegmentCriteriaEngine criteriaEngine)
    {
        _context = context;
        _criteriaEngine = criteriaEngine;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(
        RecalculateSegmentMembersCommand request,
        CancellationToken cancellationToken)
    {
        // Load segment with members
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        // Verify it's a dynamic segment
        if (segment.Type != SegmentType.Dynamic)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.Validation("CustomerSegment.Type", "Only dynamic segments can be recalculated"));
        }

        // Verify criteria exists
        if (string.IsNullOrWhiteSpace(segment.Criteria))
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.Validation("CustomerSegment.Criteria", "Segment criteria is empty"));
        }

        // Evaluate criteria and get matching customer IDs
        var matchingCustomerIds = await _criteriaEngine.EvaluateCriteriaAsync(
            segment.Criteria,
            request.TenantId,
            cancellationToken);

        // Recalculate members
        var recalculateResult = segment.RecalculateMembers(matchingCustomerIds);
        if (recalculateResult.IsFailure)
        {
            return Result<CustomerSegmentDto>.Failure(recalculateResult.Error);
        }

        // Save changes
        await _context.SaveChangesAsync(cancellationToken);

        // Reload to get updated member count
        await _context.Entry(segment).ReloadAsync(cancellationToken);

        // Return DTO
        var dto = new CustomerSegmentDto
        {
            Id = segment.Id,
            TenantId = segment.TenantId,
            Name = segment.Name,
            Description = segment.Description,
            Type = segment.Type,
            Criteria = segment.Criteria,
            Color = segment.Color,
            IsActive = segment.IsActive,
            MemberCount = segment.MemberCount,
            CreatedBy = segment.CreatedBy,
            LastModifiedBy = segment.LastModifiedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result<CustomerSegmentDto>.Success(dto);
    }
}
