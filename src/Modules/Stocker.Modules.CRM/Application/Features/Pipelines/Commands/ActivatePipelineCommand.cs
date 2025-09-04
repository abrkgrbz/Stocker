using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to activate a pipeline
/// </summary>
public class ActivatePipelineCommand : IRequest<Result<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

/// <summary>
/// Validator for ActivatePipelineCommand
/// </summary>
public class ActivatePipelineCommandValidator : AbstractValidator<ActivatePipelineCommand>
{
    public ActivatePipelineCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}