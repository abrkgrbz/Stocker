using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class DeletePipelineCommandHandler : IRequestHandler<DeletePipelineCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeletePipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
        {
            return Result.Failure(new Error("Pipeline.NotFound", "Pipeline not found", ErrorType.NotFound));
        }

        // Check if pipeline is default
        if (pipeline.IsDefault)
        {
            return Result.Failure(new Error("Pipeline.CannotDeleteDefault", "Cannot delete default pipeline", ErrorType.Validation));
        }

        // Check if pipeline has any deals or opportunities
        var hasDeals = await _context.Deals.AnyAsync(d => d.PipelineId == request.Id, cancellationToken);
        var hasOpportunities = await _context.Opportunities.AnyAsync(o => o.PipelineId == request.Id, cancellationToken);

        if (hasDeals || hasOpportunities)
        {
            return Result.Failure(new Error("Pipeline.HasRecords", "Cannot delete pipeline with existing deals or opportunities", ErrorType.Validation));
        }

        _context.Pipelines.Remove(pipeline);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}