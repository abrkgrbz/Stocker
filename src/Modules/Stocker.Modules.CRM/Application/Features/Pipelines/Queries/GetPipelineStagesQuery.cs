using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineStagesQuery : IRequest<IEnumerable<PipelineStageDto>>
{
    public Guid PipelineId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetPipelineStagesQueryHandler : IRequestHandler<GetPipelineStagesQuery, IEnumerable<PipelineStageDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetPipelineStagesQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PipelineStageDto>> Handle(GetPipelineStagesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var stages = await _unitOfWork.ReadRepository<PipelineStage>().AsQueryable()
            .Where(s => s.PipelineId == request.PipelineId && s.TenantId == tenantId)
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
