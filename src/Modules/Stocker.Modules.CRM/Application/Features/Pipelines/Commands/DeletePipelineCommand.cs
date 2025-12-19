using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

public class DeletePipelineCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeletePipelineCommandValidator : AbstractValidator<DeletePipelineCommand>
{
    public DeletePipelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeletePipelineCommandHandler : IRequestHandler<DeletePipelineCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeletePipelineCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeletePipelineCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var pipeline = await _unitOfWork.ReadRepository<Pipeline>().AsQueryable()
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        if (pipeline.IsDefault)
            return Result.Failure(Error.Conflict("Pipeline.IsDefault", "Cannot delete default pipeline"));

        // Check if pipeline has any opportunities
        var hasOpportunities = await _unitOfWork.ReadRepository<Opportunity>().AsQueryable()
            .AnyAsync(o => o.PipelineId == request.Id && o.TenantId == tenantId, cancellationToken);

        if (hasOpportunities)
            return Result.Failure(Error.Conflict("Pipeline.HasOpportunities", "Cannot delete pipeline with existing opportunities"));

        _unitOfWork.Repository<Pipeline>().Remove(pipeline);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}