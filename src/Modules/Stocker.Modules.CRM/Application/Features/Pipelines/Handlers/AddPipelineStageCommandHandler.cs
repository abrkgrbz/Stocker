using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class AddPipelineStageCommandHandler : IRequestHandler<AddPipelineStageCommand, Result<PipelineStageDto>>
{
    private readonly CRMDbContext _context;
    private readonly IMapper _mapper;

    public AddPipelineStageCommandHandler(CRMDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PipelineStageDto>> Handle(AddPipelineStageCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.PipelineId && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
        {
            return Result.Failure<PipelineStageDto>(new Error("Pipeline.NotFound", "Pipeline not found", ErrorType.NotFound));
        }

        try
        {
            var maxOrder = pipeline.Stages.Any() ? pipeline.Stages.Max(s => s.DisplayOrder) : 0;
            
            var stage = pipeline.AddStage(
                request.Name,
                request.Probability,
                maxOrder + 1,
                request.IsWon,
                request.IsLost
            );

            await _context.SaveChangesAsync(cancellationToken);

            var dto = _mapper.Map<PipelineStageDto>(stage);
            return Result.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<PipelineStageDto>(new Error("Pipeline.StageError", ex.Message, ErrorType.Validation));
        }
    }
}