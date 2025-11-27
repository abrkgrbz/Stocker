using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class DeleteCampaignCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteCampaignCommandValidator : AbstractValidator<DeleteCampaignCommand>
{
    public DeleteCampaignCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Campaign ID is required");
    }
}

public class DeleteCampaignCommandHandler : IRequestHandler<DeleteCampaignCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeleteCampaignCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteCampaignCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return Result.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.Id} not found"));

        _context.Campaigns.Remove(campaign);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}