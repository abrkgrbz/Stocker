using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class CreatePipelineCommandHandler : IRequestHandler<CreatePipelineCommand, Result<PipelineDto>>
{
    private readonly IWriteRepository<Pipeline> _pipelineRepository;
    private readonly IReadRepository<Pipeline> _readRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePipelineCommandHandler(
        IWriteRepository<Pipeline> pipelineRepository,
        IReadRepository<Pipeline> readRepository,
        IUnitOfWork unitOfWork)
    {
        _pipelineRepository = pipelineRepository;
        _readRepository = readRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PipelineDto>> Handle(CreatePipelineCommand request, CancellationToken cancellationToken)
    {
        // If this pipeline is set as default, unset any existing default pipeline
        if (request.IsDefault)
        {
            var existingDefaults = await _readRepository
                .AsQueryable()
                .Where(p => p.TenantId == request.TenantId && p.IsDefault)
                .ToListAsync(cancellationToken);

            foreach (var existing in existingDefaults)
            {
                existing.UnsetDefault();
            }
        }

        // Create pipeline entity
        var pipeline = new Pipeline(
            tenantId: request.TenantId,
            name: request.Name,
            type: request.Type,
            currency: "TRY"
        );

        // Set optional properties
        if (!string.IsNullOrEmpty(request.Description))
        {
            pipeline.UpdateDetails(request.Name, request.Description);
        }

        if (request.IsDefault)
        {
            pipeline.SetAsDefault();
        }

        if (!request.IsActive)
        {
            pipeline.Deactivate();
        }

        // Add stages to pipeline
        foreach (var stageDto in request.Stages.OrderBy(s => s.Order))
        {
            pipeline.AddStage(
                name: stageDto.Name,
                probability: stageDto.Probability,
                order: stageDto.Order,
                isWon: stageDto.IsWon,
                isLost: stageDto.IsLost
            );
        }

        // Save to database
        await _pipelineRepository.AddAsync(pipeline, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var pipelineDto = new PipelineDto
        {
            Id = pipeline.Id,
            Name = pipeline.Name,
            Description = pipeline.Description,
            Type = pipeline.Type,
            IsActive = pipeline.IsActive,
            IsDefault = pipeline.IsDefault,
            Stages = pipeline.Stages.Select(s => new PipelineStageDto
            {
                Id = s.Id,
                PipelineId = s.PipelineId,
                Name = s.Name,
                Description = s.Description,
                Order = s.DisplayOrder,
                Probability = s.Probability,
                Color = s.Color ?? "#1890ff",
                IsWon = s.IsWon,
                IsLost = s.IsLost,
                ItemCount = 0,
                TotalValue = 0
            }).ToList(),
            OpportunityCount = 0,
            DealCount = 0,
            TotalValue = 0,
            CreatedAt = DateTime.UtcNow
        };

        return Result<PipelineDto>.Success(pipelineDto);
    }
}