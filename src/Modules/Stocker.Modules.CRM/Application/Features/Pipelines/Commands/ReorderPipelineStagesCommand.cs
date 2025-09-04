using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
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