using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class DeleteCampaignCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class DeleteCampaignCommandValidator : AbstractValidator<DeleteCampaignCommand>
{
    public DeleteCampaignCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Campaign ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class DeleteCampaignCommandHandler : IRequestHandler<DeleteCampaignCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteCampaignCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCampaignCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Result.Failure(Error.NotFound("Campaign.NotFound", $"Campaign with ID {request.Id} not found"));

        _unitOfWork.Repository<Campaign>().Remove(campaign);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
