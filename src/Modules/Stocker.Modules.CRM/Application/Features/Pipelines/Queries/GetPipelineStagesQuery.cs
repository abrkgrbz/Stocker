using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineStagesQuery : IRequest<IEnumerable<PipelineStageDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid PipelineId { get; set; }
}

public class GetPipelineStagesQueryHandler : IRequestHandler<GetPipelineStagesQuery, IEnumerable<PipelineStageDto>>
{
    private readonly CRMDbContext _context;

    public GetPipelineStagesQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PipelineStageDto>> Handle(GetPipelineStagesQuery request, CancellationToken cancellationToken)
    {
        var stages = await _context.Set<PipelineStage>()
            .Where(s => s.PipelineId == request.PipelineId && s.TenantId == request.TenantId)
            .OrderBy(s => s.DisplayOrder)
            .ToListAsync(cancellationToken);

        return stages.Select(s => new PipelineStageDto
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
        }).ToList();
    }
}