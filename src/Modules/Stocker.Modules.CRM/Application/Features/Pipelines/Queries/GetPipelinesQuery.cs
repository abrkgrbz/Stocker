using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelinesQuery : IRequest<IEnumerable<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDefault { get; set; }
}

public class GetPipelinesQueryHandler : IRequestHandler<GetPipelinesQuery, IEnumerable<PipelineDto>>
{
    private readonly CRMDbContext _context;

    public GetPipelinesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PipelineDto>> Handle(GetPipelinesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Pipelines
            .Include(p => p.Stages)
            .Where(p => p.TenantId == request.TenantId);

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        if (request.IsDefault.HasValue)
            query = query.Where(p => p.IsDefault == request.IsDefault.Value);

        var pipelines = await query
            .OrderBy(p => p.DisplayOrder)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return pipelines.Select(p => new PipelineDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            Description = p.Description,
            Type = p.Type,
            IsActive = p.IsActive,
            IsDefault = p.IsDefault,
            DisplayOrder = p.DisplayOrder,
            Currency = p.Currency,
            Stages = p.Stages.Select(s => new PipelineStageDto
            {
                Id = s.Id,
                PipelineId = s.PipelineId,
                Name = s.Name,
                Description = s.Description,
                Probability = s.Probability,
                DisplayOrder = s.DisplayOrder,
                IsWon = s.IsWon,
                IsLost = s.IsLost,
                IsActive = s.IsActive,
                Color = s.Color,
                RottenDays = s.RottenDays
            }).OrderBy(s => s.DisplayOrder).ToList()
        }).ToList();
    }
}