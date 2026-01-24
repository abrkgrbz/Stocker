using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesPipelines.Commands;

namespace Stocker.Modules.Sales.Application.Features.SalesPipelines.Validators;

public class CreateSalesPipelineCommandValidator : AbstractValidator<CreateSalesPipelineCommand>
{
    public CreateSalesPipelineCommandValidator()
    {
        RuleFor(x => x.Dto.Code)
            .NotEmpty().WithMessage("Pipeline code is required")
            .MaximumLength(20).WithMessage("Pipeline code must not exceed 20 characters");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Pipeline name is required")
            .MaximumLength(100).WithMessage("Pipeline name must not exceed 100 characters");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class UpdateSalesPipelineCommandValidator : AbstractValidator<UpdateSalesPipelineCommand>
{
    public UpdateSalesPipelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.Dto.Name)
            .MaximumLength(100).WithMessage("Pipeline name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Name));

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class AddPipelineStageCommandValidator : AbstractValidator<AddPipelineStageCommand>
{
    public AddPipelineStageCommandValidator()
    {
        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.Dto.Code)
            .NotEmpty().WithMessage("Stage code is required")
            .MaximumLength(20).WithMessage("Stage code must not exceed 20 characters");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Stage name is required")
            .MaximumLength(100).WithMessage("Stage name must not exceed 100 characters");

        RuleFor(x => x.Dto.OrderIndex)
            .GreaterThanOrEqualTo(0).WithMessage("Sort order cannot be negative");

        RuleFor(x => x.Dto.SuccessProbability)
            .InclusiveBetween(0, 100).WithMessage("Probability must be between 0 and 100");

        RuleFor(x => x.Dto.Category)
            .NotEmpty().WithMessage("Category is required")
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class ReorderPipelineStageCommandValidator : AbstractValidator<ReorderPipelineStageCommand>
{
    public ReorderPipelineStageCommandValidator()
    {
        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.StageId)
            .NotEmpty().WithMessage("Stage ID is required");

        RuleFor(x => x.NewOrderIndex)
            .GreaterThanOrEqualTo(0).WithMessage("New order index cannot be negative");
    }
}
