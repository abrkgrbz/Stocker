using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Events.CRM;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class CreateDealCommandHandler : IRequestHandler<CreateDealCommand, Result<DealDto>>
{
    private readonly IDealRepository _dealRepository;
    private readonly IReadRepository<Pipeline> _pipelineRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ICurrentUserService _currentUserService;

    public CreateDealCommandHandler(
        IDealRepository dealRepository,
        IReadRepository<Pipeline> pipelineRepository,
        IUnitOfWork unitOfWork,
        IPublishEndpoint publishEndpoint,
        ICurrentUserService currentUserService)
    {
        _dealRepository = dealRepository;
        _pipelineRepository = pipelineRepository;
        _unitOfWork = unitOfWork;
        _publishEndpoint = publishEndpoint;
        _currentUserService = currentUserService;
    }

    public async Task<Result<DealDto>> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        // Create Money value object
        var value = Money.Create(request.Amount, request.Currency);

        // Get default pipeline and stage if not provided
        Guid pipelineId;
        Guid stageId;

        if (request.PipelineId.HasValue && request.CurrentStageId.HasValue)
        {
            pipelineId = request.PipelineId.Value;
            stageId = request.CurrentStageId.Value;
        }
        else
        {
            // Query for default pipeline with its stages
            var defaultPipeline = await _pipelineRepository
                .AsQueryable()
                .Include(p => p.Stages)
                .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.IsDefault && p.IsActive, cancellationToken);

            if (defaultPipeline == null)
            {
                return Result<DealDto>.Failure(
                    Error.NotFound("Deal.Pipeline.NotFound", "No default pipeline found. Please create a pipeline first or specify pipeline and stage."));
            }

            pipelineId = defaultPipeline.Id;

            // Get the first stage
            var firstStage = defaultPipeline.GetFirstStage();
            if (firstStage == null)
            {
                return Result<DealDto>.Failure(
                    Error.Validation("Deal.Pipeline.NoStages", "Default pipeline has no stages. Please add stages to the pipeline."));
            }

            stageId = firstStage.Id;
        }

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

        // Reload deal with navigation properties for DTO mapping
        var createdDeal = await _dealRepository.AsQueryable()
            .Include(d => d.Customer)
            .Include(d => d.Pipeline)
            .Include(d => d.Stage)
            .FirstOrDefaultAsync(d => d.Id == deal.Id, cancellationToken);

        if (createdDeal == null)
        {
            return Result<DealDto>.Failure(Error.NotFound("Deal.NotFound", "Deal was created but could not be retrieved."));
        }

        // Publish OpportunityCreatedEvent to RabbitMQ
        var opportunityEvent = new OpportunityCreatedEvent(
            OpportunityId: deal.Id,
            LeadId: Guid.Empty, // Deal is not created from Lead in this case
            TenantId: deal.TenantId,
            Title: deal.Name,
            Description: deal.Description,
            EstimatedValue: deal.Value.Amount,
            Currency: deal.Value.Currency,
            Probability: deal.Probability,
            EstimatedCloseDate: deal.ExpectedCloseDate,
            CreatedAt: deal.CreatedAt,
            CreatedBy: _currentUserService.UserId ?? Guid.Empty
        );

        await _publishEndpoint.Publish(opportunityEvent, cancellationToken);

        // Map to DTO with navigation properties
        var dealDto = new DealDto
        {
            Id = createdDeal.Id,
            Title = createdDeal.Name,
            Description = createdDeal.Description,
            CustomerId = createdDeal.CustomerId ?? Guid.Empty,
            CustomerName = createdDeal.Customer?.CompanyName ?? string.Empty,
            Amount = createdDeal.Value.Amount,
            Currency = createdDeal.Value.Currency,
            Status = createdDeal.Status,
            Priority = createdDeal.Priority,
            PipelineId = createdDeal.PipelineId,
            PipelineName = createdDeal.Pipeline?.Name,
            CurrentStageId = createdDeal.StageId,
            CurrentStageName = createdDeal.Stage?.Name,
            ExpectedCloseDate = createdDeal.ExpectedCloseDate ?? DateTime.UtcNow,
            Probability = createdDeal.Probability,
            CompetitorName = request.CompetitorName,
            Source = request.Source,
            OwnerId = request.OwnerId,
            CreatedAt = createdDeal.CreatedAt,
            UpdatedAt = createdDeal.UpdatedAt
        };

        return Result<DealDto>.Success(dealDto);
    }
}
