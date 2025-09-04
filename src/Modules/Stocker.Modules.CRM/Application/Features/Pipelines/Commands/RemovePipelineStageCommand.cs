using FluentValidation;
using MediatR;
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