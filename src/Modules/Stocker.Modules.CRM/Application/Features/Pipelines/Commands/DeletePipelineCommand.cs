using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Commands;

public class DeletePipelineCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeletePipelineCommandValidator : AbstractValidator<DeletePipelineCommand>
{
    public DeletePipelineCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Pipeline ID is required");
    }
}

public class DeletePipelineCommandHandler : IRequestHandler<DeletePipelineCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeletePipelineCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", $"Pipeline with ID {request.Id} not found"));

        if (pipeline.IsDefault)
            return Result.Failure(Error.Conflict("Pipeline.IsDefault", "Cannot delete default pipeline"));

        // Check if pipeline has any opportunities
        var hasOpportunities = await _context.Opportunities
            .AnyAsync(o => o.PipelineId == request.Id && o.TenantId == request.TenantId, cancellationToken);

        if (hasOpportunities)
            return Result.Failure(Error.Conflict("Pipeline.HasOpportunities", "Cannot delete pipeline with existing opportunities"));

        _context.Pipelines.Remove(pipeline);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}