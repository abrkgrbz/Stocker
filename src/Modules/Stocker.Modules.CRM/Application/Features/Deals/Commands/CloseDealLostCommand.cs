using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CloseDealLostCommand : IRequest<Result<DealDto>>
{
    public Guid Id { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string LostReason { get; set; } = string.Empty;
    public string? CompetitorName { get; set; }
}

public class CloseDealLostCommandValidator : AbstractValidator<CloseDealLostCommand>
{
    public CloseDealLostCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ActualCloseDate)
            .LessThanOrEqualTo(DateTime.UtcNow).When(x => x.ActualCloseDate.HasValue)
            .WithMessage("Actual close date cannot be in the future");

        RuleFor(x => x.LostReason)
            .NotEmpty().WithMessage("Lost reason is required")
            .MaximumLength(500).WithMessage("Lost reason must not exceed 500 characters");

        RuleFor(x => x.CompetitorName)
            .MaximumLength(200).WithMessage("Competitor name must not exceed 200 characters");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CloseDealLostCommandHandler : IRequestHandler<CloseDealLostCommand, Result<DealDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CloseDealLostCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealDto>> Handle(CloseDealLostCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        var closeDate = request.ActualCloseDate ?? DateTime.UtcNow;
        deal.MarkAsLost(closeDate, request.LostReason, request.CompetitorName);

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
            LostReason = deal.LostReason,
            CompetitorName = deal.CompetitorName,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}
