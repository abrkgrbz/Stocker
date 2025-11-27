using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class MoveDealStageCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid DealId { get; set; }
    public Guid NewStageId { get; set; }
    public string? Notes { get; set; }
}

public class MoveDealStageCommandValidator : AbstractValidator<MoveDealStageCommand>
{
    public MoveDealStageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.NewStageId)
            .NotEmpty().WithMessage("New stage ID is required");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
    }
}

public class MoveDealStageCommandHandler : IRequestHandler<MoveDealStageCommand, Result<DealDto>>
{
    private readonly CRMDbContext _context;

    public MoveDealStageCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DealDto>> Handle(MoveDealStageCommand request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var stage = await _context.PipelineStages
            .FirstOrDefaultAsync(s => s.Id == request.NewStageId && s.PipelineId == deal.PipelineId, cancellationToken);

        if (stage == null)
            return Result<DealDto>.Failure(Error.NotFound("Stage.NotFound", "Stage not found in the deal's pipeline"));

        deal.MoveToStage(request.NewStageId, stage.Probability);

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
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}