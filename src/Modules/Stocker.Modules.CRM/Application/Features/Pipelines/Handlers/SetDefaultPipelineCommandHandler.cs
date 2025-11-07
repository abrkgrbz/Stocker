using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class SetDefaultPipelineCommandHandler : IRequestHandler<SetDefaultPipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;
    private readonly IMapper _mapper;

    public SetDefaultPipelineCommandHandler(CRMDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PipelineDto>> Handle(SetDefaultPipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
        {
            return Result.Failure<PipelineDto>(new Error("Pipeline.NotFound", "Pipeline not found", ErrorType.NotFound));
        }

        if (pipeline.IsDefault)
        {
            // Already default, return success
            var currentDto = _mapper.Map<PipelineDto>(pipeline);
            return Result.Success(currentDto);
        }

        // Remove default from other pipelines of same type
        var otherPipelines = await _context.Pipelines
            .Where(p => p.TenantId == request.TenantId && p.Type == pipeline.Type && p.IsDefault && p.Id != request.Id)
            .ToListAsync(cancellationToken);

        foreach (var otherPipeline in otherPipelines)
        {
            otherPipeline.UnsetDefault();
        }

        pipeline.SetAsDefault();

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<PipelineDto>(pipeline);
        return Result.Success(dto);
    }
}
