using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class MoveDealStageCommand : IRequest<Result<DealDto>>
{
    public Guid DealId { get; set; }
    public Guid NewStageId { get; set; }
    public string? Notes { get; set; }
}

public class MoveDealStageCommandValidator : AbstractValidator<MoveDealStageCommand>
{
    public MoveDealStageCommandValidator()
    {
        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.NewStageId)
            .NotEmpty().WithMessage("New stage ID is required");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class MoveDealStageCommandHandler : IRequestHandler<MoveDealStageCommand, Result<DealDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public MoveDealStageCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealDto>> Handle(MoveDealStageCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var stage = await _unitOfWork.ReadRepository<PipelineStage>().AsQueryable()
            .FirstOrDefaultAsync(s => s.Id == request.NewStageId && s.PipelineId == deal.PipelineId, cancellationToken);

        if (stage == null)
            return Result<DealDto>.Failure(Error.NotFound("Stage.NotFound", "Stage not found in the deal's pipeline"));

        deal.MoveToStage(request.NewStageId, stage.Probability);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
