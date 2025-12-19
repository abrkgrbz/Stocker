using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to remove a pipeline stage
/// </summary>
public class RemovePipelineStageCommand : IRequest<Result<Unit>>
{
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
        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.StageId)
            .NotEmpty().WithMessage("Stage ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class RemovePipelineStageCommandHandler : IRequestHandler<RemovePipelineStageCommand, Result<Unit>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public RemovePipelineStageCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(RemovePipelineStageCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.PipelineId && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return Result<Unit>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.PipelineId} not found"));

        // Check if stage has opportunities
        var hasOpportunities = await _unitOfWork.ReadRepository<Opportunity>().AsQueryable()
            .AnyAsync(o => o.StageId == request.StageId && o.TenantId == tenantId, cancellationToken);

        if (hasOpportunities)
            return Result<Unit>.Failure(Error.Conflict("PipelineStage.HasOpportunities", "Cannot remove stage with existing opportunities"));

        try
        {
            pipeline.RemoveStage(request.StageId);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(Error.NotFound("PipelineStage.NotFound", ex.Message));
        }
    }
}
