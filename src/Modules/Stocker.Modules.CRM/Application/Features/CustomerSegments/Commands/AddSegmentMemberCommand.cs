using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class AddSegmentMemberCommandHandler : IRequestHandler<AddSegmentMemberCommand, Result>
{
    private readonly CRMDbContext _context;

    public AddSegmentMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(AddSegmentMemberCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        // Verify customer exists
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == request.CustomerId && c.TenantId == request.TenantId, cancellationToken);

        if (!customerExists)
        {
            return Result.Failure(
                Error.NotFound("Customer.NotFound", $"Customer with ID {request.CustomerId} not found"));
        }

        var result = segment.AddMember(request.CustomerId, request.Reason);
        if (result.IsFailure)
        {
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
