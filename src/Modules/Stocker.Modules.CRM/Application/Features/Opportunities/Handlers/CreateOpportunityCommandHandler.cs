using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Opportunities.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Handlers;

public class CreateOpportunityCommandHandler : IRequestHandler<CreateOpportunityCommand, Result<OpportunityDto>>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateOpportunityCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(CreateOpportunityCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement opportunity creation logic
        // This is a placeholder implementation until Opportunity entity and repository are created
        
        var opportunityDto = new OpportunityDto
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CustomerId = request.CustomerId,
            Amount = request.Amount,
            Currency = request.Currency,
            Probability = request.Probability,
            ExpectedCloseDate = request.ExpectedCloseDate,
            Status = request.Status,
            PipelineId = request.PipelineId,
            CurrentStageId = request.CurrentStageId,
            CompetitorName = request.CompetitorName,
            Source = request.Source,
            OwnerId = request.OwnerId,
            Score = request.Score,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<OpportunityDto>.Success(opportunityDto);
    }
}