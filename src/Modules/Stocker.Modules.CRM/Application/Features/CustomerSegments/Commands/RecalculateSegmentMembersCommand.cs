using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
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
