using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

/// <summary>
/// Command to set a pipeline as default
/// </summary>
public class SetDefaultPipelineCommand : IRequest<Result<PipelineDto>>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Validator for SetDefaultPipelineCommand
/// </summary>
public class SetDefaultPipelineCommandValidator : AbstractValidator<SetDefaultPipelineCommand>
{
    public SetDefaultPipelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class SetDefaultPipelineCommandHandler : IRequestHandler<SetDefaultPipelineCommand, Result<PipelineDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public SetDefaultPipelineCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PipelineDto>> Handle(SetDefaultPipelineCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return Result<PipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        if (!pipeline.IsActive)
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.NotActive", "Cannot set inactive pipeline as default"));

        // Unset current default for the same type
        var existingDefault = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.IsDefault && p.Type == pipeline.Type && p.Id != request.Id, cancellationToken);

        existingDefault?.UnsetDefault();
        pipeline.SetAsDefault();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
