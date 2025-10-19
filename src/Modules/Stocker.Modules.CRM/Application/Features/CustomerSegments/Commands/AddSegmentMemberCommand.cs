using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class AddSegmentMemberCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid SegmentId { get; set; }
    public Guid CustomerId { get; set; }
    public SegmentMembershipReason Reason { get; set; } = SegmentMembershipReason.Manual;
}

public class AddSegmentMemberCommandValidator : AbstractValidator<AddSegmentMemberCommand>
{
    public AddSegmentMemberCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Reason)
            .IsInEnum().WithMessage("Invalid membership reason");
    }
}
