using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CloseDealWonCommand : IRequest<Result<DealDto>>
{
    public Guid Id { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string? WonDetails { get; set; }
    public decimal? FinalAmount { get; set; }
}

public class CloseDealWonCommandValidator : AbstractValidator<CloseDealWonCommand>
{
    public CloseDealWonCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ActualCloseDate)
            .LessThanOrEqualTo(DateTime.UtcNow).When(x => x.ActualCloseDate.HasValue)
            .WithMessage("Actual close date cannot be in the future");

        RuleFor(x => x.WonDetails)
            .MaximumLength(1000).WithMessage("Won details must not exceed 1000 characters");

        RuleFor(x => x.FinalAmount)
            .GreaterThan(0).When(x => x.FinalAmount.HasValue)
            .WithMessage("Final amount must be greater than 0");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CloseDealWonCommandHandler : IRequestHandler<CloseDealWonCommand, Result<DealDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CloseDealWonCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealDto>> Handle(CloseDealWonCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        var closeDate = request.ActualCloseDate ?? DateTime.UtcNow;
        deal.MarkAsWon(closeDate);

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
            WonDetails = request.WonDetails,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}
