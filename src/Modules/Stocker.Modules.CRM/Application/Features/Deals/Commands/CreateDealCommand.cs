using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CreateDealCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
}

public class CreateDealCommandValidator : AbstractValidator<CreateDealCommand>
{
    public CreateDealCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
            .NotEmpty().WithMessage("Expected close date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("Expected close date must be in the future");

        RuleFor(x => x.Probability)
            .InclusiveBetween(0, 100).WithMessage("Probability must be between 0 and 100");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");

        RuleFor(x => x.Source)
            .MaximumLength(100).WithMessage("Source must not exceed 100 characters");
    }
}

public class CreateDealCommandHandler : IRequestHandler<CreateDealCommand, Result<DealDto>>
{
    private readonly CRMDbContext _context;

    public CreateDealCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DealDto>> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        Guid pipelineId = request.PipelineId ?? Guid.Empty;
        Guid stageId = request.StageId ?? Guid.Empty;

        if (request.PipelineId.HasValue)
        {
            var pipeline = await _context.Pipelines
                .FirstOrDefaultAsync(p => p.Id == request.PipelineId.Value && p.TenantId == request.TenantId, cancellationToken);

            if (pipeline == null)
                return Result<DealDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

            pipelineId = pipeline.Id;

            if (request.StageId.HasValue)
            {
                var stage = await _context.PipelineStages
                    .FirstOrDefaultAsync(s => s.Id == request.StageId.Value && s.PipelineId == pipelineId, cancellationToken);

                if (stage == null)
                    return Result<DealDto>.Failure(Error.NotFound("Stage.NotFound", "Stage not found"));

                stageId = stage.Id;
            }
        }

        var value = Money.Create(request.Amount, request.Currency);
        int ownerId = 1;

        if (!string.IsNullOrEmpty(request.OwnerId) && int.TryParse(request.OwnerId, out var parsedOwnerId))
        {
            ownerId = parsedOwnerId;
        }

        var deal = new Deal(request.TenantId, request.Title, pipelineId, stageId, value, ownerId);
        deal.UpdateDetails(request.Title, request.Description, value);
        deal.SetExpectedCloseDate(request.ExpectedCloseDate);
        deal.SetPriority(request.Priority);

        if (request.CustomerId != Guid.Empty)
        {
            deal.AssignToCustomer(request.CustomerId);
        }

        _context.Deals.Add(deal);
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
            CompetitorName = deal.CompetitorName,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}