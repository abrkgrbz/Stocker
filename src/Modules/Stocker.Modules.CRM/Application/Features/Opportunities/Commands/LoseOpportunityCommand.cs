using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to mark an opportunity as lost
/// </summary>
public class LoseOpportunityCommand : IRequest<Result<OpportunityDto>>
{
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

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class LoseOpportunityCommandHandler : IRequestHandler<LoseOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public LoseOpportunityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(LoseOpportunityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        var lostDate = request.LostDate ?? DateTime.UtcNow;
        opportunity.MarkAsLost(lostDate, request.LostReason ?? string.Empty, request.CompetitorName);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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