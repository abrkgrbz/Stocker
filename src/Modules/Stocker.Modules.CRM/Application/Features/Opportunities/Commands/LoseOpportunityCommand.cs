using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to mark an opportunity as lost
/// </summary>
public class LoseOpportunityCommand : IRequest<Result<OpportunityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? LostDate { get; set; }
    public string? LostReason { get; set; }
    public string? CompetitorName { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Validator for LoseOpportunityCommand
/// </summary>
public class LoseOpportunityCommandValidator : AbstractValidator<LoseOpportunityCommand>
{
    public LoseOpportunityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.LostDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Lost date cannot be in the future")
            .When(x => x.LostDate.HasValue);

        RuleFor(x => x.LostReason)
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");
    }
}

public class LoseOpportunityCommandHandler : IRequestHandler<LoseOpportunityCommand, Result<OpportunityDto>>
{
    private readonly CRMDbContext _context;

    public LoseOpportunityCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OpportunityDto>> Handle(LoseOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _context.Opportunities
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == request.TenantId, cancellationToken);

        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        var lostDate = request.LostDate ?? DateTime.UtcNow;
        opportunity.MarkAsLost(lostDate, request.LostReason ?? string.Empty, request.CompetitorName);

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
            CurrentStageName = opportunity.Stage?.Name,
            LostReason = opportunity.LostReason,
            CompetitorName = opportunity.CompetitorName,
            OwnerId = opportunity.OwnerId.ToString(),
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt
        };

        return Result<OpportunityDto>.Success(dto);
    }
}