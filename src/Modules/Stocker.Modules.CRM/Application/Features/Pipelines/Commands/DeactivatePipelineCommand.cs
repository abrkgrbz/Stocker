using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to deactivate a pipeline
/// </summary>
public class DeactivatePipelineCommand : IRequest<Result<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

/// <summary>
/// Validator for DeactivatePipelineCommand
/// </summary>
public class DeactivatePipelineCommandValidator : AbstractValidator<DeactivatePipelineCommand>
{
    public DeactivatePipelineCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}

public class DeactivatePipelineCommandHandler : IRequestHandler<DeactivatePipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;

    public DeactivatePipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PipelineDto>> Handle(DeactivatePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result<PipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        try
        {
            pipeline.Deactivate();
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
        catch (InvalidOperationException ex)
        {
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.CannotDeactivate", ex.Message));
        }
    }
}