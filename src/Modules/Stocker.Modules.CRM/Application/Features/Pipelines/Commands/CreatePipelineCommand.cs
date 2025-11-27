using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

public class CreatePipelineCommand : IRequest<Result<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PipelineType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public List<CreatePipelineStageDto> Stages { get; set; } = new();
}

public class CreatePipelineStageDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public decimal Probability { get; set; }
    public string Color { get; set; } = "#1890ff";
    public bool IsWon { get; set; } = false;
    public bool IsLost { get; set; } = false;
}

public class CreatePipelineCommandValidator : AbstractValidator<CreatePipelineCommand>
{
    public CreatePipelineCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Pipeline name is required")
            .MaximumLength(200).WithMessage("Pipeline name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid pipeline type");

        RuleFor(x => x.Stages)
            .NotEmpty().WithMessage("At least one stage is required");

        RuleForEach(x => x.Stages).ChildRules(stage =>
        {
            stage.RuleFor(s => s.Name)
                .NotEmpty().WithMessage("Stage name is required")
                .MaximumLength(100).WithMessage("Stage name must not exceed 100 characters");

            stage.RuleFor(s => s.Description)
                .MaximumLength(500).WithMessage("Stage description must not exceed 500 characters");

            stage.RuleFor(s => s.Order)
                .GreaterThanOrEqualTo(0).WithMessage("Stage order must be greater than or equal to 0");

            stage.RuleFor(s => s.Probability)
                .InclusiveBetween(0, 100).WithMessage("Stage probability must be between 0 and 100");

            stage.RuleFor(s => s.Color)
                .NotEmpty().WithMessage("Stage color is required");
        });
    }
}

public class CreatePipelineCommandHandler : IRequestHandler<CreatePipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;

    public CreatePipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PipelineDto>> Handle(CreatePipelineCommand request, CancellationToken cancellationToken)
    {
        // Check if name already exists for tenant
        var nameExists = await _context.Pipelines
            .AnyAsync(p => p.TenantId == request.TenantId && p.Name == request.Name, cancellationToken);

        if (nameExists)
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.NameExists", $"Pipeline with name '{request.Name}' already exists"));

        // If this is marked as default, unset any existing default
        if (request.IsDefault)
        {
            var existingDefault = await _context.Pipelines
                .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.IsDefault && p.Type == request.Type, cancellationToken);

            existingDefault?.UnsetDefault();
        }

        var pipeline = new Pipeline(request.TenantId, request.Name, request.Type);

        if (!string.IsNullOrEmpty(request.Description))
            pipeline.UpdateDetails(request.Name, request.Description);

        if (request.IsDefault)
            pipeline.SetAsDefault();

        if (!request.IsActive)
            pipeline.Deactivate();

        // Add stages
        foreach (var stageDto in request.Stages.OrderBy(s => s.Order))
        {
            var stage = pipeline.AddStage(stageDto.Name, stageDto.Probability, stageDto.Order, stageDto.IsWon, stageDto.IsLost);
            if (!string.IsNullOrEmpty(stageDto.Description))
                stage.UpdateDetails(stageDto.Name, stageDto.Description, stageDto.Probability);
            stage.SetColor(stageDto.Color);
        }

        _context.Pipelines.Add(pipeline);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PipelineDto
        {
            Id = pipeline.Id,
            TenantId = pipeline.TenantId,
            Name = pipeline.Name,
            Description = pipeline.Description,
            Type = pipeline.Type,
            IsActive = pipeline.IsActive,
            IsDefault = pipeline.IsDefault,
            DisplayOrder = pipeline.DisplayOrder,
            Currency = pipeline.Currency,
            Stages = pipeline.Stages.Select(s => new PipelineStageDto
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
            }).OrderBy(s => s.DisplayOrder).ToList()
        };

        return Result<PipelineDto>.Success(dto);
    }
}