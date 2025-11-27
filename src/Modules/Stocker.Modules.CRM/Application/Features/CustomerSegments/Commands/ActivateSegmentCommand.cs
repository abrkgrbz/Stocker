using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class ActivateSegmentCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class ActivateSegmentCommandValidator : AbstractValidator<ActivateSegmentCommand>
{
    public ActivateSegmentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

public class ActivateSegmentCommandHandler : IRequestHandler<ActivateSegmentCommand, Result>
{
    private readonly CRMDbContext _context;

    public ActivateSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ActivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        segment.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
