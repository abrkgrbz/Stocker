using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;

public class DeleteCustomerSegmentCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteCustomerSegmentCommandValidator : AbstractValidator<DeleteCustomerSegmentCommand>
{
    public DeleteCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

public class DeleteCustomerSegmentCommandHandler : IRequestHandler<DeleteCustomerSegmentCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeleteCustomerSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        // Remove all members first
        _context.CustomerSegmentMembers.RemoveRange(segment.Members);
        _context.CustomerSegments.Remove(segment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
