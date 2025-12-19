using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

public class UpdateOpportunityCommand : IRequest<Result<OpportunityDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal Probability { get; set; }
    public DateTime ExpectedCloseDate { get; set; }
    public OpportunityStatus Status { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? CurrentStageId { get; set; }
    public string? LostReason { get; set; }
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
    public int Score { get; set; }
}

public class UpdateOpportunityCommandValidator : AbstractValidator<UpdateOpportunityCommand>
{
    public UpdateOpportunityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Opportunity name is required")
            .MaximumLength(200).WithMessage("Opportunity name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Probability)
            .InclusiveBetween(0, 100).WithMessage("Probability must be between 0 and 100");

        RuleFor(x => x.ExpectedCloseDate)
            .NotEmpty().WithMessage("Expected close date is required");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid opportunity status");

        RuleFor(x => x.LostReason)
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Source)
            .MaximumLength(100).WithMessage("Source must not exceed 100 characters");

        RuleFor(x => x.Score)
            .InclusiveBetween(0, 100).WithMessage("Score must be between 0 and 100");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdateOpportunityCommandHandler : IRequestHandler<UpdateOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateOpportunityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(UpdateOpportunityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        var amount = Money.Create(request.Amount, request.Currency);
        opportunity.UpdateDetails(request.Name, request.Description, amount, request.ExpectedCloseDate);
        opportunity.AssignToCustomer(request.CustomerId);

        if (request.CurrentStageId.HasValue && request.CurrentStageId.Value != opportunity.StageId)
        {
            var stage = await _unitOfWork.ReadRepository<Domain.Entities.PipelineStage>().AsQueryable()
                .FirstOrDefaultAsync(s => s.Id == request.CurrentStageId.Value && s.PipelineId == opportunity.PipelineId, cancellationToken);

            if (stage != null)
                opportunity.MoveToStage(request.CurrentStageId.Value, stage.Probability);
        }

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