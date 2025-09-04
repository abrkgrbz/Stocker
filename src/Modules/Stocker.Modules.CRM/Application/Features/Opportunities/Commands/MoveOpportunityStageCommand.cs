using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

public class MoveOpportunityStageCommand : IRequest<Result<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid OpportunityId { get; set; }
    public Guid NewStageId { get; set; }
    public string? Notes { get; set; }
}

public class MoveOpportunityStageCommandValidator : AbstractValidator<MoveOpportunityStageCommand>
{
    public MoveOpportunityStageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.NewStageId)
            .NotEmpty().WithMessage("New stage ID is required");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
    }
}