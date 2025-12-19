using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

/// <summary>
/// Command to recalculate members for a dynamic segment based on its criteria
/// </summary>
public class RecalculateSegmentMembersCommand : IRequest<Result<CustomerSegmentDto>>
{
    public Guid SegmentId { get; set; }
}

public class RecalculateSegmentMembersCommandValidator : AbstractValidator<RecalculateSegmentMembersCommand>
{
    public RecalculateSegmentMembersCommandValidator()
    {
        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RecalculateSegmentMembersCommandHandler : IRequestHandler<RecalculateSegmentMembersCommand, Result<CustomerSegmentDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RecalculateSegmentMembersCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(RecalculateSegmentMembersCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == tenantId, cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        // For now, just get all active customers as a placeholder
        // In a real implementation, the criteria would be parsed and evaluated
        var customerIds = await _unitOfWork.ReadRepository<Domain.Entities.Customer>().AsQueryable()
            .Where(c => c.TenantId == tenantId && c.IsActive)
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        var result = segment.RecalculateMembers(customerIds);
        if (result.IsFailure)
        {
            return Result<CustomerSegmentDto>.Failure(result.Error);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
