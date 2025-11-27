using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

public class UpdatePipelineCommand : IRequest<Result<PipelineDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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

public class UpdatePipelineCommandHandler : IRequestHandler<UpdatePipelineCommand, Result<PipelineDto>>
{
    private readonly CRMDbContext _context;

    public UpdatePipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PipelineDto>> Handle(UpdatePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result<PipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        // Check if name is taken by another pipeline
        var nameExists = await _context.Pipelines
            .AnyAsync(p => p.TenantId == request.TenantId && p.Name == request.Name && p.Id != request.Id, cancellationToken);

        if (nameExists)
            return Result<PipelineDto>.Failure(Error.Conflict("Pipeline.NameExists", $"Pipeline with name '{request.Name}' already exists"));

        pipeline.UpdateDetails(request.Name, request.Description);

        // Handle default status
        if (request.IsDefault && !pipeline.IsDefault)
        {
            var existingDefault = await _context.Pipelines
                .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.IsDefault && p.Type == pipeline.Type && p.Id != request.Id, cancellationToken);

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