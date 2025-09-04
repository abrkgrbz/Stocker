using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class CreateDealCommandHandler : IRequestHandler<CreateDealCommand, Result<DealDto>>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateDealCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealDto>> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement deal creation logic
        // This is a placeholder implementation until Deal entity and repository are created
        
        var dealDto = new DealDto
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CustomerId = request.CustomerId,
            Amount = request.Amount,
            Currency = request.Currency,
            Status = request.Status,
            Priority = request.Priority,
            PipelineId = request.PipelineId,
            CurrentStageId = request.CurrentStageId,
            ExpectedCloseDate = request.ExpectedCloseDate,
            Probability = request.Probability,
            CompetitorName = request.CompetitorName,
            Source = request.Source,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<DealDto>.Success(dealDto);
    }
}