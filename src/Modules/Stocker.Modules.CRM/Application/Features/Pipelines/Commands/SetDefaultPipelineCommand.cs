using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to set a pipeline as default
/// </summary>
public class SetDefaultPipelineCommand : IRequest<Result<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

/// <summary>
/// Validator for SetDefaultPipelineCommand
/// </summary>
public class SetDefaultPipelineCommandValidator : AbstractValidator<SetDefaultPipelineCommand>
{
    public SetDefaultPipelineCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}

public class SetDefaultPipelineCommandHandler : IRequestHandler<SetDefaultPipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;

    public SetDefaultPipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PipelineDto>> Handle(SetDefaultPipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result<PipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        if (!pipeline.IsActive)
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.NotActive", "Cannot set inactive pipeline as default"));

        // Unset current default for the same type
        var existingDefault = await _context.Pipelines
            .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.IsDefault && p.Type == pipeline.Type && p.Id != request.Id, cancellationToken);

        existingDefault?.UnsetDefault();
        pipeline.SetAsDefault();

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
