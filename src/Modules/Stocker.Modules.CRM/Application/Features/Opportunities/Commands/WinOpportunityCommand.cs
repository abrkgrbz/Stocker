using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to mark an opportunity as won
/// </summary>
public class WinOpportunityCommand : IRequest<Result<OpportunityDto>>
{
    public Guid Id { get; set; }
    public DateTime? WonDate { get; set; }
    public string? WinReason { get; set; }
    public string? Notes { get; set; }
    public decimal? ActualAmount { get; set; }
    public bool CreateDeal { get; set; } = true;
}

/// <summary>
/// Validator for WinOpportunityCommand
/// </summary>
public class WinOpportunityCommandValidator : AbstractValidator<WinOpportunityCommand>
{
    public WinOpportunityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Opportunity ID is required");

        RuleFor(x => x.WonDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Won date cannot be in the future")
            .When(x => x.WonDate.HasValue);

        RuleFor(x => x.WinReason)
            .MaximumLength(500).WithMessage("Win reason must not exceed 500 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");

        RuleFor(x => x.ActualAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Actual amount must be greater than or equal to 0")
            .When(x => x.ActualAmount.HasValue);
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class WinOpportunityCommandHandler : IRequestHandler<WinOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public WinOpportunityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(WinOpportunityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.Id} not found"));

        var wonDate = request.WonDate ?? DateTime.UtcNow;
        opportunity.MarkAsWon(wonDate);

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
            OwnerId = opportunity.OwnerId.ToString(),
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt
        };

        return Result<OpportunityDto>.Success(dto);
    }
}