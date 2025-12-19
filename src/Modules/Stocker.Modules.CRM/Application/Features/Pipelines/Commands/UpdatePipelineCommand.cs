using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

public class UpdatePipelineCommand : IRequest<Result<PipelineDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PipelineType Type { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
}

public class UpdatePipelineCommandValidator : AbstractValidator<UpdatePipelineCommand>
{
    public UpdatePipelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Pipeline name is required")
            .MaximumLength(200).WithMessage("Pipeline name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid pipeline type");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdatePipelineCommandHandler : IRequestHandler<UpdatePipelineCommand, Result<PipelineDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdatePipelineCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PipelineDto>> Handle(UpdatePipelineCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return Result<PipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        // Check if name is taken by another pipeline
        var nameExists = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .AnyAsync(p => p.TenantId == tenantId && p.Name == request.Name && p.Id != request.Id, cancellationToken);

        if (nameExists)
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.NameExists", $"Pipeline with name '{request.Name}' already exists"));

        pipeline.UpdateDetails(request.Name, request.Description);

        // Handle default status
        if (request.IsDefault && !pipeline.IsDefault)
        {
            var existingDefault = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
                .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.IsDefault && p.Type == pipeline.Type && p.Id != request.Id, cancellationToken);

            existingDefault?.UnsetDefault();
            pipeline.SetAsDefault();
        }
        else if (!request.IsDefault && pipeline.IsDefault)
        {
            pipeline.UnsetDefault();
        }

        // Handle active status
        if (request.IsActive && !pipeline.IsActive)
            pipeline.Activate();
        else if (!request.IsActive && pipeline.IsActive)
            pipeline.Deactivate();

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