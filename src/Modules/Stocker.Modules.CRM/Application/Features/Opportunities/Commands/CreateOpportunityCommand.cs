using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

public class CreateOpportunityCommand : IRequest<Result<OpportunityDto>>
{
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
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
    public int Score { get; set; }
}

public class CreateOpportunityCommandValidator : AbstractValidator<CreateOpportunityCommand>
{
    public CreateOpportunityCommandValidator()
    {
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
            .NotEmpty().WithMessage("Expected close date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("Expected close date must be in the future");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid opportunity status");

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
public class CreateOpportunityCommandHandler : IRequestHandler<CreateOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateOpportunityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(CreateOpportunityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        Guid pipelineId;
        Guid stageId;

        if (request.PipelineId.HasValue && request.CurrentStageId.HasValue)
        {
            pipelineId = request.PipelineId.Value;
            stageId = request.CurrentStageId.Value;

            var stage = await _unitOfWork.ReadRepository<Domain.Entities.PipelineStage>().AsQueryable()
                .FirstOrDefaultAsync(s => s.Id == stageId && s.PipelineId == pipelineId, cancellationToken);

            if (stage == null)
                return Result<OpportunityDto>.Failure(Error.NotFound("Stage.NotFound", "Stage not found in the specified pipeline"));
        }
        else
        {
            var defaultPipeline = await _unitOfWork.ReadRepository<Domain.Entities.Pipeline>().AsQueryable()
                .Include(p => p.Stages)
                .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.IsActive, cancellationToken);

            if (defaultPipeline == null)
                return Result<OpportunityDto>.Failure(Error.NotFound("Pipeline.NotFound", "No active pipeline found"));

            var firstStage = defaultPipeline.Stages.OrderBy(s => s.DisplayOrder).FirstOrDefault();
            if (firstStage == null)
                return Result<OpportunityDto>.Failure(Error.NotFound("Stage.NotFound", "Pipeline has no stages"));

            pipelineId = defaultPipeline.Id;
            stageId = firstStage.Id;
        }

        var ownerId = int.TryParse(request.OwnerId, out var id) ? id : 0;
        var amount = Money.Create(request.Amount, request.Currency);

        var opportunity = new Opportunity(
            tenantId,
            request.Name,
            pipelineId,
            stageId,
            amount,
            request.ExpectedCloseDate,
            ownerId);

        opportunity.AssignToCustomer(request.CustomerId);

        await _unitOfWork.Repository<Opportunity>().AddAsync(opportunity, cancellationToken);
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
            CurrentStageId = opportunity.StageId,
            OwnerId = opportunity.OwnerId.ToString(),
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt
        };

        return Result<OpportunityDto>.Success(dto);
    }
}