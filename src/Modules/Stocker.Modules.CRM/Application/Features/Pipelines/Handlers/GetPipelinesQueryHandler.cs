using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Queries;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class GetPipelinesQueryHandler : IRequestHandler<GetPipelinesQuery, IEnumerable<PipelineDto>>
{
    private readonly IReadRepository<Pipeline> _readRepository;

    public GetPipelinesQueryHandler(IReadRepository<Pipeline> readRepository)
    {
        _readRepository = readRepository;
    }

    public async Task<IEnumerable<PipelineDto>> Handle(GetPipelinesQuery request, CancellationToken cancellationToken)
    {
        // Get all pipelines with stages
        var pipelines = await _readRepository
            .AsQueryable()
            .Include(p => p.Stages)
            .Where(p => p.TenantId == request.TenantId)
            .OrderByDescending(p => p.IsDefault)
            .ThenByDescending(p => p.IsActive)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        return pipelines.Select(pipeline => new PipelineDto
        {
            Id = pipeline.Id,
            Name = pipeline.Name,
            Description = pipeline.Description,
            Type = pipeline.Type,
            IsActive = pipeline.IsActive,
            IsDefault = pipeline.IsDefault,
            Stages = pipeline.Stages.OrderBy(s => s.DisplayOrder).Select(s => new PipelineStageDto
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
        }).ToList();
    }
}