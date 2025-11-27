using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

/// <summary>
/// Command to recalculate members for a dynamic segment based on its criteria
/// </summary>
public class RecalculateSegmentMembersCommand : IRequest<Result<CustomerSegmentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid SegmentId { get; set; }
}

public class RecalculateSegmentMembersCommandValidator : AbstractValidator<RecalculateSegmentMembersCommand>
{
    public RecalculateSegmentMembersCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

public class RecalculateSegmentMembersCommandHandler : IRequestHandler<RecalculateSegmentMembersCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public RecalculateSegmentMembersCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(RecalculateSegmentMembersCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        // For now, just get all active customers as a placeholder
        // In a real implementation, the criteria would be parsed and evaluated
        var customerIds = await _context.Customers
            .Where(c => c.TenantId == request.TenantId && c.IsActive)
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        var result = segment.RecalculateMembers(customerIds);
        if (result.IsFailure)
        {
            return Result<CustomerSegmentDto>.Failure(result.Error);
        }

        await _context.SaveChangesAsync(cancellationToken);

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
            LastModifiedBy = segment.LastModifiedBy
        };

        return Result<CustomerSegmentDto>.Success(dto);
    }
}
