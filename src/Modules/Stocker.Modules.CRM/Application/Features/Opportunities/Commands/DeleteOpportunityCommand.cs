using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

public class DeleteOpportunityCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteOpportunityCommandValidator : AbstractValidator<DeleteOpportunityCommand>
{
    public DeleteOpportunityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");
    }
}

public class DeleteOpportunityCommandHandler : IRequestHandler<DeleteOpportunityCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeleteOpportunityCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _context.Opportunities
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == request.TenantId, cancellationToken);

        if (opportunity == null)
            return Result.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        _context.Opportunities.Remove(opportunity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}