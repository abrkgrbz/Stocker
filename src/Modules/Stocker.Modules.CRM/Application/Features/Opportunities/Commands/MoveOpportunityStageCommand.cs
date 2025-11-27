using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
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

public class MoveOpportunityStageCommandHandler : IRequestHandler<MoveOpportunityStageCommand, Result<OpportunityDto>>
{
    private readonly CRMDbContext _context;

    public MoveOpportunityStageCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OpportunityDto>> Handle(MoveOpportunityStageCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _context.Opportunities
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .FirstOrDefaultAsync(o => o.Id == request.OpportunityId && o.TenantId == request.TenantId, cancellationToken);

        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.OpportunityId} not found"));

        var stage = await _context.PipelineStages
            .FirstOrDefaultAsync(s => s.Id == request.NewStageId && s.PipelineId == opportunity.PipelineId, cancellationToken);

        if (stage == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Stage.NotFound", "Stage not found in the opportunity's pipeline"));

        opportunity.MoveToStage(request.NewStageId, stage.Probability);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new OpportunityDto
        {
            Id = opportunity.Id,
            Name = opportunity.Name,
            Description = opportunity.Description,
            CustomerId = opportunity.CustomerId ?? Guid.Empty,
            Amount = opportunity.Amount.Amount,
            Currency = opportunity.Amount.Currency,
            Probability = opportunity.Probability,
            ExpectedCloseDate = opportunity.ExpectedCloseDate,
            Status = opportunity.Status,
            PipelineId = opportunity.PipelineId,
            PipelineName = opportunity.Pipeline?.Name,
            CurrentStageId = opportunity.StageId,
            CurrentStageName = stage.Name,
            OwnerId = opportunity.OwnerId.ToString(),
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt
        };

        return Result<OpportunityDto>.Success(dto);
    }
}