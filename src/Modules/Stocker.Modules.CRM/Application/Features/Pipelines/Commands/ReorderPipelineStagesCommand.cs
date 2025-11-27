using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to reorder pipeline stages
/// </summary>
public class ReorderPipelineStagesCommand : IRequest<Result<IEnumerable<PipelineStageDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid PipelineId { get; set; }
    public List<StageOrderDto> StageOrders { get; set; } = new();
}

/// <summary>
/// DTO for stage ordering
/// </summary>
public class StageOrderDto
{
    public Guid StageId { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// Validator for ReorderPipelineStagesCommand
/// </summary>
public class ReorderPipelineStagesCommandValidator : AbstractValidator<ReorderPipelineStagesCommand>
{
    public ReorderPipelineStagesCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.StageOrders)
            .NotEmpty().WithMessage("At least one stage order is required");

        RuleForEach(x => x.StageOrders).ChildRules(order =>
        {
            order.RuleFor(o => o.StageId)
                .NotEmpty().WithMessage("Stage ID is required");

            order.RuleFor(o => o.Order)
                .GreaterThanOrEqualTo(0).WithMessage("Order must be greater than or equal to 0");
        });
    }
}

public class ReorderPipelineStagesCommandHandler : IRequestHandler<ReorderPipelineStagesCommand, Result<IEnumerable<PipelineStageDto>>>
{
    private readonly CRMDbContext _context;

    public ReorderPipelineStagesCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<PipelineStageDto>>> Handle(ReorderPipelineStagesCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.PipelineId && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result<IEnumerable<PipelineStageDto>>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.PipelineId} not found"));

        try
        {
            var stageIds = request.StageOrders.OrderBy(s => s.Order).Select(s => s.StageId).ToList();
            pipeline.ReorderStages(stageIds);
            await _context.SaveChangesAsync(cancellationToken);

            var stages = pipeline.Stages.Select(s => new PipelineStageDto
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
            }).OrderBy(s => s.DisplayOrder).ToList();

            return Result<IEnumerable<PipelineStageDto>>.Success(stages);
        }
        catch (ArgumentException ex)
        {
            return Result<IEnumerable<PipelineStageDto>>.Failure(Error.Validation("PipelineStage.ReorderFailed", ex.Message));
        }
    }
}