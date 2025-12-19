using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

public class GetPipelineByIdQuery : IRequest<PipelineDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetPipelineByIdQueryHandler : IRequestHandler<GetPipelineByIdQuery, PipelineDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetPipelineByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PipelineDto?> Handle(GetPipelineByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return null;

        return new PipelineDto
        {
            Id = pipeline.Id,
            TenantId = pipeline.TenantId,
            Name = pipeline.Name,
            Description = pipeline.Description,
            Type = pipeline.Type,
            IsActive = pipeline.IsActive,
            IsDefault = pipeline.IsDefault,
            DisplayOrder = pipeline.DisplayOrder,
            Currency = pipeline.Currency,
            Stages = pipeline.Stages.Select(s => new PipelineStageDto
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
        };
    }
}
