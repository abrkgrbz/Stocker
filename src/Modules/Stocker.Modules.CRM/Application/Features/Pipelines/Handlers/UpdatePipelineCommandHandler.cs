using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class UpdatePipelineCommandHandler : IRequestHandler<UpdatePipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;
    private readonly IMapper _mapper;

    public UpdatePipelineCommandHandler(CRMDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PipelineDto>> Handle(UpdatePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
        {
            return Result.Failure<PipelineDto>(new Error("Pipeline.NotFound", "Pipeline not found", ErrorType.NotFound));
        }

        pipeline.UpdateDetails(request.Name, request.Description);
        
        if (request.IsActive && !pipeline.IsActive)
        {
            pipeline.Activate();
        }
        else if (!request.IsActive && pipeline.IsActive)
        {
            pipeline.Deactivate();
        }

        if (request.IsDefault && !pipeline.IsDefault)
        {
            // Remove default from other pipelines of same type
            var otherPipelines = await _context.Pipelines
                .Where(p => p.TenantId == request.TenantId && p.Type == pipeline.Type && p.IsDefault && p.Id != request.Id)
                .ToListAsync(cancellationToken);

            foreach (var otherPipeline in otherPipelines)
            {
                otherPipeline.UnsetDefault();
            }

            pipeline.SetAsDefault();
        }
        else if (!request.IsDefault && pipeline.IsDefault)
        {
            pipeline.UnsetDefault();
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<PipelineDto>(pipeline);
        return Result.Success(dto);
    }
}