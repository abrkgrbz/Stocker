using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class RemoveSegmentMemberCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid SegmentId { get; set; }
    public Guid CustomerId { get; set; }
}

public class RemoveSegmentMemberCommandValidator : AbstractValidator<RemoveSegmentMemberCommand>
{
    public RemoveSegmentMemberCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.SegmentId)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}

public class RemoveSegmentMemberCommandHandler : IRequestHandler<RemoveSegmentMemberCommand, Result>
{
    private readonly CRMDbContext _context;

    public RemoveSegmentMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RemoveSegmentMemberCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.SegmentId} not found"));
        }

        var result = segment.RemoveMember(request.CustomerId);
        if (result.IsFailure)
        {
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
