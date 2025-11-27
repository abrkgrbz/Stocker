using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to update a pipeline stage
/// </summary>
public class UpdatePipelineStageCommand : IRequest<Result<PipelineStageDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid PipelineId { get; set; }
    public Guid StageId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public decimal Probability { get; set; }
    public string Color { get; set; } = "#1890ff";
    public bool IsWon { get; set; } = false;
    public bool IsLost { get; set; } = false;
}

/// <summary>
/// Validator for UpdatePipelineStageCommand
/// </summary>
public class UpdatePipelineStageCommandValidator : AbstractValidator<UpdatePipelineStageCommand>
{
    public UpdatePipelineStageCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PipelineId)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.StageId)
            .NotEmpty().WithMessage("Stage ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Stage name is required")
            .MaximumLength(100).WithMessage("Stage name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Stage description must not exceed 500 characters");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Stage order must be greater than or equal to 0");

        RuleFor(x => x.Probability)
            .InclusiveBetween(0, 100).WithMessage("Stage probability must be between 0 and 100");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Stage color is required");
    }
}

public class UpdatePipelineStageCommandHandler : IRequestHandler<UpdatePipelineStageCommand, Result<PipelineStageDto>>
{
    private readonly CRMDbContext _context;

    public UpdatePipelineStageCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PipelineStageDto>> Handle(UpdatePipelineStageCommand request, CancellationToken cancellationToken)
    {
        var stage = await _context.Set<Domain.Entities.PipelineStage>()
            .FirstOrDefaultAsync(s => s.Id == request.StageId && s.PipelineId == request.PipelineId && s.TenantId == request.TenantId, cancellationToken);

        if (stage == null)
            return Result<PipelineStageDto>.Failure(Error.NotFound("PipelineStage.NotFound", $"Pipeline stage with ID {request.StageId} not found"));

        stage.UpdateDetails(request.Name, request.Description, request.Probability);
        stage.SetColor(request.Color);
        stage.SetDisplayOrder(request.Order);

        if (request.IsWon)
            stage.MarkAsWon();
        else if (request.IsLost)
            stage.MarkAsLost();
        else
            stage.MarkAsActive();

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PipelineStageDto
        {
            Id = stage.Id,
            PipelineId = stage.PipelineId,
            Name = stage.Name,
            Description = stage.Description,
            Probability = stage.Probability,
            DisplayOrder = stage.DisplayOrder,
            IsWon = stage.IsWon,
            IsLost = stage.IsLost,
            IsActive = stage.IsActive,
            Color = stage.Color,
            RottenDays = stage.RottenDays
        };

        return Result<PipelineStageDto>.Success(dto);
    }
}