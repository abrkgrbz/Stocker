using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class UpdateSegmentCriteriaCommand : IRequest<Result<CustomerSegmentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string Criteria { get; set; } = string.Empty;
    public Guid ModifiedBy { get; set; }
}

public class UpdateSegmentCriteriaCommandValidator : AbstractValidator<UpdateSegmentCriteriaCommand>
{
    public UpdateSegmentCriteriaCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Criteria)
            .NotEmpty().WithMessage("Criteria is required");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("Modified by user ID is required");
    }
}

public class UpdateSegmentCriteriaCommandHandler : IRequestHandler<UpdateSegmentCriteriaCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public UpdateSegmentCriteriaCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(UpdateSegmentCriteriaCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        var result = segment.UpdateCriteria(request.Criteria, request.ModifiedBy);
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
