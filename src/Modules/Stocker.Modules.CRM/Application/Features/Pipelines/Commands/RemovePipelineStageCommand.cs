using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to remove a pipeline stage
/// </summary>
public class RemovePipelineStageCommand : IRequest<Result<Unit>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid PipelineId { get; set; }
    public Guid StageId { get; set; }
}

/// <summary>
/// Validator for RemovePipelineStageCommand
/// </summary>
public class RemovePipelineStageCommandValidator : AbstractValidator<RemovePipelineStageCommand>
{
    public RemovePipelineStageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.StageId)
            .NotEmpty().WithMessage("Stage ID is required");
    }
}

public class RemovePipelineStageCommandHandler : IRequestHandler<RemovePipelineStageCommand, Result<Unit>>
{
    private readonly CRMDbContext _context;

    public RemovePipelineStageCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(RemovePipelineStageCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.PipelineId && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result<Unit>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.PipelineId} not found"));

        // Check if stage has opportunities
        var hasOpportunities = await _context.Opportunities
            .AnyAsync(o => o.StageId == request.StageId && o.TenantId == request.TenantId, cancellationToken);

        if (hasOpportunities)
            return Result<Unit>.Failure(Error.Conflict("PipelineStage.HasOpportunities", "Cannot remove stage with existing opportunities"));

        try
        {
            pipeline.RemoveStage(request.StageId);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(Error.NotFound("PipelineStage.NotFound", ex.Message));
        }
    }
}