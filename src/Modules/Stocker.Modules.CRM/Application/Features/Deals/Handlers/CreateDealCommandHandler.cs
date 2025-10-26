using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class CreateDealCommandHandler : IRequestHandler<CreateDealCommand, Result<DealDto>>
{
    private readonly IDealRepository _dealRepository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateDealCommandHandler(
        IDealRepository dealRepository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _dealRepository = dealRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealDto>> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        // Create Money value object
        var value = Money.Create(request.Amount, request.Currency);

        // For now, use a default pipeline and stage if not provided
        // TODO: Get default pipeline/stage from configuration or create one
        var pipelineId = request.PipelineId ?? Guid.NewGuid(); // Temporary: should get from defaults
        var stageId = request.CurrentStageId ?? Guid.NewGuid(); // Temporary: should get from defaults

        // Parse OwnerId (default to 1 if not provided or invalid)
        int ownerId = 1;
        if (!string.IsNullOrEmpty(request.OwnerId) && int.TryParse(request.OwnerId, out var parsedOwnerId))
        {
            ownerId = parsedOwnerId;
        }

        // Create Deal entity
        var deal = new Deal(
            tenantId: request.TenantId,
            name: request.Title,
            pipelineId: pipelineId,
            stageId: stageId,
            value: value,
            ownerId: ownerId
        );

        // Set optional properties
        if (!string.IsNullOrEmpty(request.Description))
        {
            deal.UpdateDetails(request.Title, request.Description, value);
        }

        if (request.CustomerId != Guid.Empty)
        {
            deal.AssignToCustomer(request.CustomerId);
        }

        if (request.ExpectedCloseDate != default)
        {
            deal.SetExpectedCloseDate(request.ExpectedCloseDate);
        }

        if (request.Priority != default)
        {
            deal.SetPriority(request.Priority);
        }

        // Add to repository
        await _dealRepository.AddAsync(deal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dealDto = new DealDto
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
            CurrentStageId = deal.StageId,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            Probability = deal.Probability,
            CompetitorName = request.CompetitorName,
            Source = request.Source,
            OwnerId = request.OwnerId,
            CreatedAt = deal.CreatedAt
        };

        return Result<DealDto>.Success(dealDto);
    }
}
