using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesPipelines.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesPipelines.Handlers;

public class CreateSalesPipelineHandler : IRequestHandler<CreateSalesPipelineCommand, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateSalesPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(CreateSalesPipelineCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        PipelineType type = PipelineType.Standard;
        if (!string.IsNullOrWhiteSpace(dto.Type) && Enum.TryParse<PipelineType>(dto.Type, true, out var t))
            type = t;

        Result<SalesPipeline> result;

        if (dto.CreateWithDefaultStages)
        {
            result = SalesPipeline.CreateWithDefaultStages(_unitOfWork.TenantId, dto.Code, dto.Name);
        }
        else
        {
            result = SalesPipeline.Create(_unitOfWork.TenantId, dto.Code, dto.Name, type);
        }

        if (!result.IsSuccess)
            return Result<SalesPipelineDto>.Failure(result.Error);

        var pipeline = result.Value;

        if (!string.IsNullOrWhiteSpace(dto.Description))
            pipeline.UpdateDetails(null, dto.Description, type != PipelineType.Standard ? type : null);

        await _unitOfWork.SalesPipelines.AddAsync(pipeline, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesPipelineDto>.Success(MapToDto(pipeline));
    }

    internal static SalesPipelineDto MapToDto(SalesPipeline entity) => new()
    {
        Id = entity.Id,
        Code = entity.Code,
        Name = entity.Name,
        Description = entity.Description,
        IsDefault = entity.IsDefault,
        IsActive = entity.IsActive,
        Type = entity.Type.ToString(),
        TotalOpportunities = entity.TotalOpportunities,
        TotalPipelineValue = entity.TotalPipelineValue,
        AverageConversionRate = entity.AverageConversionRate,
        AverageDaysToClose = entity.AverageDaysToClose,
        Stages = entity.Stages.OrderBy(s => s.OrderIndex).Select(MapStageToDto).ToList()
    };

    internal static SalesPipelineListDto MapToListDto(SalesPipeline entity) => new()
    {
        Id = entity.Id,
        Code = entity.Code,
        Name = entity.Name,
        IsDefault = entity.IsDefault,
        IsActive = entity.IsActive,
        Type = entity.Type.ToString(),
        TotalOpportunities = entity.TotalOpportunities,
        TotalPipelineValue = entity.TotalPipelineValue,
        StageCount = entity.Stages.Count
    };

    internal static PipelineStageDto MapStageToDto(PipelineStage stage) => new()
    {
        Id = stage.Id,
        Code = stage.Code,
        Name = stage.Name,
        Description = stage.Description,
        OrderIndex = stage.OrderIndex,
        Category = stage.Category.ToString(),
        SuccessProbability = stage.SuccessProbability,
        OpportunityCount = stage.OpportunityCount,
        StageValue = stage.StageValue,
        RequiresApproval = stage.RequiresApproval,
        MaxDaysInStage = stage.MaxDaysInStage,
        Color = stage.Color,
        Icon = stage.Icon
    };
}

public class UpdateSalesPipelineHandler : IRequestHandler<UpdateSalesPipelineCommand, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateSalesPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(UpdateSalesPipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.Id, cancellationToken);
        if (pipeline == null)
            return Result<SalesPipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        PipelineType? type = null;
        if (!string.IsNullOrWhiteSpace(request.Dto.Type) && Enum.TryParse<PipelineType>(request.Dto.Type, true, out var t))
            type = t;

        pipeline.UpdateDetails(request.Dto.Name, request.Dto.Description, type);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesPipelineDto>.Success(CreateSalesPipelineHandler.MapToDto(pipeline));
    }
}

public class AddPipelineStageHandler : IRequestHandler<AddPipelineStageCommand, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddPipelineStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(AddPipelineStageCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.PipelineId, cancellationToken);
        if (pipeline == null)
            return Result<SalesPipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        if (!Enum.TryParse<StageCategory>(request.Dto.Category, true, out var category))
            return Result<SalesPipelineDto>.Failure(Error.Validation("Pipeline.InvalidCategory", "Invalid stage category"));

        var stageResult = pipeline.AddStage(
            request.Dto.Code,
            request.Dto.Name,
            request.Dto.OrderIndex,
            request.Dto.SuccessProbability,
            category);

        if (!stageResult.IsSuccess)
            return Result<SalesPipelineDto>.Failure(stageResult.Error);

        var stage = stageResult.Value;
        if (!string.IsNullOrWhiteSpace(request.Dto.Color) || !string.IsNullOrWhiteSpace(request.Dto.Icon))
            stage.SetVisual(request.Dto.Color, request.Dto.Icon);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<SalesPipelineDto>.Success(CreateSalesPipelineHandler.MapToDto(pipeline));
    }
}

public class RemovePipelineStageHandler : IRequestHandler<RemovePipelineStageCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemovePipelineStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemovePipelineStageCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.PipelineId, cancellationToken);
        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        var result = pipeline.RemoveStage(request.StageId);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class ReorderPipelineStageHandler : IRequestHandler<ReorderPipelineStageCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ReorderPipelineStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ReorderPipelineStageCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.PipelineId, cancellationToken);
        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        var result = pipeline.ReorderStage(request.StageId, request.NewOrderIndex);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetDefaultPipelineHandler : IRequestHandler<SetDefaultPipelineCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetDefaultPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SetDefaultPipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetByIdAsync(request.Id, cancellationToken);
        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        // Clear existing default
        var currentDefault = await _unitOfWork.SalesPipelines.GetDefaultAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != pipeline.Id)
            currentDefault.ClearDefault();

        pipeline.SetAsDefault();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class ActivatePipelineHandler : IRequestHandler<ActivatePipelineCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ActivatePipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ActivatePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetByIdAsync(request.Id, cancellationToken);
        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        pipeline.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class DeactivatePipelineHandler : IRequestHandler<DeactivatePipelineCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeactivatePipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivatePipelineCommand request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.Id, cancellationToken);
        if (pipeline == null)
            return Result.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        var result = pipeline.Deactivate();
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
