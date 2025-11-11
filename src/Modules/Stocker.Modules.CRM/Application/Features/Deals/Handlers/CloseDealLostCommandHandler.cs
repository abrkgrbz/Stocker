using MassTransit;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Commands;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Events.CRM;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class CloseDealLostCommandHandler : IRequestHandler<CloseDealLostCommand, Result<DealDto>>
{
    private readonly IDealRepository _dealRepository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;
    private readonly IPublishEndpoint _publishEndpoint;

    public CloseDealLostCommandHandler(
        IDealRepository dealRepository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork,
        IPublishEndpoint publishEndpoint)
    {
        _dealRepository = dealRepository;
        _unitOfWork = unitOfWork;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<DealDto>> Handle(CloseDealLostCommand request, CancellationToken cancellationToken)
    {
        // Find the deal
        var deal = await _dealRepository.GetWithProductsAsync(request.Id, request.TenantId, cancellationToken);
        if (deal == null)
        {
            return Result<DealDto>.Failure(new Error("DealNotFound", "Deal not found"));
        }

        // Mark the deal as lost
        var closedDate = request.ActualCloseDate ?? DateTime.UtcNow;
        deal.MarkAsLost(closedDate, request.LostReason, request.CompetitorName);

        // Save to repository
        await _dealRepository.UpdateAsync(deal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish DealLostEvent
        var integrationEvent = new DealLostEvent(
            DealId: deal.Id,
            CustomerId: deal.CustomerId ?? Guid.Empty,
            TenantId: deal.TenantId,
            Amount: deal.Value.Amount,
            Currency: deal.Value.Currency,
            LostReason: request.LostReason,
            CompetitorName: request.CompetitorName,
            ClosedDate: closedDate,
            LostBy: Guid.Empty // TODO: Get from current user context
        );

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        // Map to DTO
        var dealDto = MapToDto(deal);

        return Result<DealDto>.Success(dealDto);
    }

    private DealDto MapToDto(Domain.Entities.Deal deal)
    {
        return new DealDto
        {
            Id = deal.Id,
            Title = deal.Name,
            Description = deal.Description,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            CustomerName = deal.Customer?.CompanyName ?? string.Empty,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Status = deal.Status,
            Priority = deal.Priority,
            PipelineId = deal.PipelineId,
            PipelineName = deal.Pipeline?.Name,
            StageId = deal.StageId,
            StageName = deal.Stage?.Name,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            ActualCloseDate = deal.ActualCloseDate,
            Probability = deal.Probability,
            LostReason = deal.LostReason,
            CompetitorName = deal.CompetitorName,
            OwnerId = deal.OwnerId.ToString(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };
    }
}
