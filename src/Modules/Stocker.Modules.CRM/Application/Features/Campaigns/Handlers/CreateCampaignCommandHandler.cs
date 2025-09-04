using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Campaigns.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Handlers;

public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, Result<CampaignDto>>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateCampaignCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CampaignDto>> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement campaign creation logic
        // This is a placeholder implementation until Campaign entity and repository are created
        
        var campaignDto = new CampaignDto
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            BudgetedCost = request.BudgetedCost,
            ExpectedRevenue = request.ExpectedRevenue,
            TargetAudience = request.TargetAudience,
            TargetLeads = request.TargetLeads,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CampaignDto>.Success(campaignDto);
    }
}