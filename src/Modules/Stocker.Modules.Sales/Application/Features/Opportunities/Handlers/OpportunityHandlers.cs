using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Opportunities.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Opportunities.Handlers;

public class CreateOpportunityHandler : IRequestHandler<CreateOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateOpportunityHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(CreateOpportunityCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var number = await _unitOfWork.Opportunities.GenerateOpportunityNumberAsync(cancellationToken);

        var result = Opportunity.Create(
            _unitOfWork.TenantId,
            number,
            dto.Title,
            dto.EstimatedValue,
            dto.Currency);

        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        var opportunity = result.Value;

        if (dto.CustomerId.HasValue)
            opportunity.SetCustomer(dto.CustomerId, dto.CustomerName);

        if (!string.IsNullOrWhiteSpace(dto.ContactName))
            opportunity.SetContact(dto.ContactName, dto.ContactEmail, dto.ContactPhone);

        if (dto.SalesPersonId.HasValue)
            opportunity.AssignTo(dto.SalesPersonId.Value, dto.SalesPersonName);

        if (dto.ExpectedCloseDate.HasValue)
            opportunity.SetExpectedCloseDate(dto.ExpectedCloseDate);

        OpportunitySource? source = null;
        OpportunityPriority? priority = null;
        if (!string.IsNullOrWhiteSpace(dto.Source) && Enum.TryParse<OpportunitySource>(dto.Source, true, out var s))
            source = s;
        if (!string.IsNullOrWhiteSpace(dto.Priority) && Enum.TryParse<OpportunityPriority>(dto.Priority, true, out var p))
            priority = p;
        if (source.HasValue || priority.HasValue)
            opportunity.SetDetails(dto.Description, source, priority);
        else if (!string.IsNullOrWhiteSpace(dto.Description))
            opportunity.SetDetails(dto.Description, null, null);

        if (!string.IsNullOrWhiteSpace(dto.Notes))
            opportunity.SetNotes(dto.Notes);

        if (!string.IsNullOrWhiteSpace(dto.Tags))
            opportunity.SetTags(dto.Tags);

        // Assign to pipeline if specified
        if (dto.PipelineId.HasValue)
        {
            var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(dto.PipelineId.Value, cancellationToken);
            if (pipeline != null)
            {
                var firstStage = pipeline.Stages.OrderBy(s => s.OrderIndex).FirstOrDefault();
                if (firstStage != null)
                    opportunity.AssignToPipeline(pipeline.Id, firstStage.Id, firstStage.SuccessProbability);
            }
        }

        await _unitOfWork.Opportunities.AddAsync(opportunity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<OpportunityDto>.Success(MapToDto(opportunity));
    }

    internal static OpportunityDto MapToDto(Opportunity entity) => new()
    {
        Id = entity.Id,
        OpportunityNumber = entity.OpportunityNumber,
        Title = entity.Title,
        Description = entity.Description,
        CustomerId = entity.CustomerId,
        CustomerName = entity.CustomerName,
        ContactName = entity.ContactName,
        ContactEmail = entity.ContactEmail,
        ContactPhone = entity.ContactPhone,
        Stage = entity.Stage.ToString(),
        Source = entity.Source.ToString(),
        Priority = entity.Priority.ToString(),
        PipelineId = entity.PipelineId,
        PipelineStageId = entity.PipelineStageId,
        EstimatedValue = entity.EstimatedValue,
        Currency = entity.Currency,
        Probability = entity.Probability,
        WeightedValue = entity.WeightedValue,
        CreatedDate = entity.CreatedDate,
        ExpectedCloseDate = entity.ExpectedCloseDate,
        ActualCloseDate = entity.ActualCloseDate,
        LastActivityDate = entity.LastActivityDate,
        NextFollowUpDate = entity.NextFollowUpDate,
        IsWon = entity.IsWon,
        IsLost = entity.IsLost,
        ClosedReason = entity.ClosedReason,
        LostToCompetitor = entity.LostToCompetitor,
        SalesPersonId = entity.SalesPersonId,
        SalesPersonName = entity.SalesPersonName,
        QuotationId = entity.QuotationId,
        QuotationNumber = entity.QuotationNumber,
        SalesOrderId = entity.SalesOrderId,
        SalesOrderNumber = entity.SalesOrderNumber,
        Notes = entity.Notes,
        Tags = entity.Tags
    };

    internal static OpportunityListDto MapToListDto(Opportunity entity) => new()
    {
        Id = entity.Id,
        OpportunityNumber = entity.OpportunityNumber,
        Title = entity.Title,
        CustomerName = entity.CustomerName,
        Stage = entity.Stage.ToString(),
        Priority = entity.Priority.ToString(),
        EstimatedValue = entity.EstimatedValue,
        Currency = entity.Currency,
        Probability = entity.Probability,
        WeightedValue = entity.WeightedValue,
        ExpectedCloseDate = entity.ExpectedCloseDate,
        SalesPersonName = entity.SalesPersonName,
        IsWon = entity.IsWon,
        IsLost = entity.IsLost
    };
}

public class UpdateOpportunityStageHandler : IRequestHandler<UpdateOpportunityStageCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateOpportunityStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(UpdateOpportunityStageCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        if (!Enum.TryParse<OpportunityStage>(request.Dto.Stage, true, out var stage))
            return Result<OpportunityDto>.Failure(Error.Validation("Opportunity.InvalidStage", "Invalid stage value"));

        var result = opportunity.UpdateStage(stage);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class UpdateOpportunityValueHandler : IRequestHandler<UpdateOpportunityValueCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateOpportunityValueHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(UpdateOpportunityValueCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        var result = opportunity.UpdateEstimatedValue(request.Dto.EstimatedValue, request.Dto.Currency);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class MarkOpportunityWonHandler : IRequestHandler<MarkOpportunityWonCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MarkOpportunityWonHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(MarkOpportunityWonCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        var result = opportunity.MarkAsWon(request.Dto?.SalesOrderId, request.Dto?.SalesOrderNumber);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class MarkOpportunityLostHandler : IRequestHandler<MarkOpportunityLostCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MarkOpportunityLostHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(MarkOpportunityLostCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        var result = opportunity.MarkAsLost(request.Dto.Reason, request.Dto.LostToCompetitor);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class ReopenOpportunityHandler : IRequestHandler<ReopenOpportunityCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ReopenOpportunityHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(ReopenOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        var result = opportunity.Reopen();
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class AssignOpportunityHandler : IRequestHandler<AssignOpportunityCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AssignOpportunityHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(AssignOpportunityCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        opportunity.AssignTo(request.Dto.SalesPersonId, request.Dto.SalesPersonName);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AssignOpportunityToPipelineHandler : IRequestHandler<AssignOpportunityToPipelineCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AssignOpportunityToPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(AssignOpportunityToPipelineCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.PipelineId, cancellationToken);
        if (pipeline == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        var firstStage = pipeline.Stages.OrderBy(s => s.OrderIndex).FirstOrDefault();
        if (firstStage == null)
            return Result<OpportunityDto>.Failure(Error.Validation("Pipeline.NoStages", "Pipeline has no stages"));

        var result = opportunity.AssignToPipeline(pipeline.Id, firstStage.Id, firstStage.SuccessProbability);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class MoveOpportunityPipelineStageHandler : IRequestHandler<MoveOpportunityPipelineStageCommand, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MoveOpportunityPipelineStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(MoveOpportunityPipelineStageCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        if (!opportunity.PipelineId.HasValue)
            return Result<OpportunityDto>.Failure(Error.Validation("Opportunity.NoPipeline", "Opportunity is not assigned to a pipeline"));

        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(opportunity.PipelineId.Value, cancellationToken);
        if (pipeline == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        var targetStage = pipeline.Stages.FirstOrDefault(s => s.Id == request.NewStageId);
        if (targetStage == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Pipeline.StageNotFound", "Target stage not found"));

        var result = opportunity.MoveToPipelineStage(request.NewStageId, targetStage.SuccessProbability);
        if (!result.IsSuccess)
            return Result<OpportunityDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class ScheduleFollowUpHandler : IRequestHandler<ScheduleFollowUpCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ScheduleFollowUpHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ScheduleFollowUpCommand request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        opportunity.ScheduleFollowUp(request.FollowUpDate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
