using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class CloseDealWonCommand : IRequest<Result<DealDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string? WonDetails { get; set; }
    public decimal? FinalAmount { get; set; }
}

public class CloseDealWonCommandValidator : AbstractValidator<CloseDealWonCommand>
{
    public CloseDealWonCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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

public class CloseDealWonCommandHandler : IRequestHandler<CloseDealWonCommand, Result<DealDto>>
{
    private readonly CRMDbContext _context;

    public CloseDealWonCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DealDto>> Handle(CloseDealWonCommand request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        var closeDate = request.ActualCloseDate ?? DateTime.UtcNow;
        deal.MarkAsWon(closeDate);

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
            WonDetails = request.WonDetails,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        return Result<DealDto>.Success(dto);
    }
}