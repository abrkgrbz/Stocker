using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class UpdateDealCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DealStatus Status { get; set; }
    public DealPriority Priority { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? StageId { get; set; }
    public DateTime ExpectedCloseDate { get; set; }
    public decimal Probability { get; set; }
    public string? LostReason { get; set; }
    public string? WonDetails { get; set; }
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
}

public class UpdateDealCommandValidator : AbstractValidator<UpdateDealCommand>
{
    public UpdateDealCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Deal title is required")
            .MaximumLength(200).WithMessage("Deal title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid deal status");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid deal priority");

        RuleFor(x => x.ExpectedCloseDate)
            .NotEmpty().WithMessage("Expected close date is required");

        RuleFor(x => x.Probability)
            .InclusiveBetween(0, 100).WithMessage("Probability must be between 0 and 100");

        RuleFor(x => x.LostReason)
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.WonDetails)
            .MaximumLength(1000).WithMessage("Won details must not exceed 1000 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Source)
            .MaximumLength(100).WithMessage("Source must not exceed 100 characters");
    }
}

public class UpdateDealCommandHandler : IRequestHandler<UpdateDealCommand, Result<DealDto>>
{
    private readonly CRMDbContext _context;

    public UpdateDealCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DealDto>> Handle(UpdateDealCommand request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        var value = Money.Create(request.Amount, request.Currency);
        deal.UpdateDetails(request.Title, request.Description, value);
        deal.SetExpectedCloseDate(request.ExpectedCloseDate);
        deal.SetPriority(request.Priority);

        if (request.CustomerId != Guid.Empty)
        {
            deal.AssignToCustomer(request.CustomerId);
        }

        if (request.StageId.HasValue)
        {
            deal.MoveToStage(request.StageId.Value, request.Probability);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DealDto
        {
            Id = deal.Id,
            Title = deal.Name,
            Description = deal.Description,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Status = deal.Status,
            Priority = deal.Priority,
            PipelineId = deal.PipelineId,
            StageId = deal.StageId,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            ActualCloseDate = deal.ActualCloseDate,
            Probability = deal.Probability,
            LostReason = deal.LostReason,
            CompetitorName = deal.CompetitorName,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}