using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class CreatePipelineCommandHandler : IRequestHandler<CreatePipelineCommand, Result<PipelineDto>>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreatePipelineCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PipelineDto>> Handle(CreatePipelineCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement pipeline creation logic
        // This is a placeholder implementation until Pipeline entity and repository are created
        
        var pipelineDto = new PipelineDto
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            IsActive = request.IsActive,
            IsDefault = request.IsDefault,
            Stages = request.Stages.Select(s => new PipelineStageDto
            {
                Id = Guid.NewGuid(),
                Name = s.Name,
                Description = s.Description,
                Order = s.Order,
                Probability = s.Probability,
                Color = s.Color,
                IsWon = s.IsWon,
                IsLost = s.IsLost
            }).ToList(),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PipelineDto>.Success(pipelineDto);
    }
}