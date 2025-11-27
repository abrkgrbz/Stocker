using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

public class DeleteLeadCommand : IRequest<Result<Unit>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteLeadCommandValidator : AbstractValidator<DeleteLeadCommand>
{
    public DeleteLeadCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Lead ID is required");
    }
}

public class DeleteLeadCommandHandler : IRequestHandler<DeleteLeadCommand, Result<Unit>>
{
    private readonly CRMDbContext _context;

    public DeleteLeadCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.Leads
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == request.TenantId, cancellationToken);

        if (lead == null)
            return Result<Unit>.Failure(Error.NotFound("Lead.NotFound", $"Lead with ID {request.Id} not found"));

        if (lead.IsConverted)
            return Result<Unit>.Failure(Error.Conflict("Lead.Converted", "Cannot delete a converted lead"));

        // Check for related activities
        var hasActivities = await _context.Activities
            .AnyAsync(a => a.LeadId == request.Id && a.TenantId == request.TenantId, cancellationToken);

        if (hasActivities)
            return Result<Unit>.Failure(Error.Conflict("Lead.HasActivities", "Cannot delete lead with existing activities"));

        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
