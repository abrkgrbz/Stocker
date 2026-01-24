using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTargets.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTargets.Handlers;

public class CreateSalesTargetHandler : IRequestHandler<CreateSalesTargetCommand, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public CreateSalesTargetHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(CreateSalesTargetCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (!Enum.TryParse<SalesTargetType>(dto.TargetType, true, out var targetType))
            return Result<SalesTargetDto>.Failure(Error.Validation("SalesTarget.TargetType", "Geçersiz hedef türü."));

        if (!Enum.TryParse<TargetPeriodType>(dto.PeriodType, true, out var periodType))
            return Result<SalesTargetDto>.Failure(Error.Validation("SalesTarget.PeriodType", "Geçersiz dönem türü."));

        if (!Enum.TryParse<TargetMetricType>(dto.MetricType, true, out var metricType))
            return Result<SalesTargetDto>.Failure(Error.Validation("SalesTarget.MetricType", "Geçersiz metrik türü."));

        var targetCode = await _unitOfWork.SalesTargets.GenerateTargetCodeAsync(cancellationToken);
        var totalTargetAmount = Money.Create(dto.TotalTargetAmount, dto.Currency);

        var result = SalesTarget.Create(
            _unitOfWork.TenantId,
            targetCode,
            dto.Name,
            targetType,
            periodType,
            dto.Year,
            totalTargetAmount,
            metricType,
            dto.MinimumAchievementPercentage,
            dto.Description);

        if (!result.IsSuccess)
            return Result<SalesTargetDto>.Failure(result.Error);

        var target = result.Value!;

        if (dto.GeneratePeriods)
        {
            var periodsResult = target.GeneratePeriods();
            if (!periodsResult.IsSuccess)
                return Result<SalesTargetDto>.Failure(periodsResult.Error);
        }

        await _unitOfWork.SalesTargets.AddAsync(target, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class AssignTargetToRepresentativeHandler : IRequestHandler<AssignTargetToRepresentativeCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AssignTargetToRepresentativeHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(AssignTargetToRepresentativeCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.AssignToSalesRepresentative(request.Dto.AssigneeId, request.Dto.AssigneeName);
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AssignTargetToTeamHandler : IRequestHandler<AssignTargetToTeamCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AssignTargetToTeamHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(AssignTargetToTeamCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.AssignToSalesTeam(request.Dto.AssigneeId, request.Dto.AssigneeName);
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AssignTargetToTerritoryHandler : IRequestHandler<AssignTargetToTerritoryCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AssignTargetToTerritoryHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(AssignTargetToTerritoryCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.AssignToTerritory(request.Dto.AssigneeId, request.Dto.AssigneeName);
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AddTargetPeriodHandler : IRequestHandler<AddTargetPeriodCommand, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AddTargetPeriodHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(AddTargetPeriodCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByCodeAsync(request.Id.ToString(), cancellationToken)
            ?? await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var dto = request.Dto;
        var targetAmount = Money.Create(dto.TargetAmount, target.TotalTargetAmount.Currency);
        var result = target.AddPeriod(dto.PeriodNumber, dto.StartDate, dto.EndDate, targetAmount, dto.TargetQuantity);
        if (!result.IsSuccess)
            return Result<SalesTargetDto>.Failure(result.Error);

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class GenerateTargetPeriodsHandler : IRequestHandler<GenerateTargetPeriodsCommand, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GenerateTargetPeriodsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(GenerateTargetPeriodsCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.GeneratePeriods();
        if (!result.IsSuccess)
            return Result<SalesTargetDto>.Failure(result.Error);

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class AddTargetProductHandler : IRequestHandler<AddTargetProductCommand, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AddTargetProductHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(AddTargetProductCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var dto = request.Dto;
        var targetAmount = Money.Create(dto.TargetAmount, target.TotalTargetAmount.Currency);
        var result = target.AddProductTarget(dto.ProductId, dto.ProductCode, dto.ProductName, targetAmount, dto.TargetQuantity, dto.Weight);
        if (!result.IsSuccess)
            return Result<SalesTargetDto>.Failure(result.Error);

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class RecordAchievementHandler : IRequestHandler<RecordAchievementCommand, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public RecordAchievementHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(RecordAchievementCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var dto = request.Dto;
        var amount = Money.Create(dto.Amount, target.TotalTargetAmount.Currency);
        var result = target.RecordAchievement(dto.AchievementDate, amount, dto.Quantity, dto.SalesOrderId, dto.InvoiceId, dto.ProductId, dto.CustomerId);
        if (!result.IsSuccess)
            return Result<SalesTargetDto>.Failure(result.Error);

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class ActivateSalesTargetHandler : IRequestHandler<ActivateSalesTargetCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public ActivateSalesTargetHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(ActivateSalesTargetCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.Activate();
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class CloseSalesTargetHandler : IRequestHandler<CloseSalesTargetCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public CloseSalesTargetHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(CloseSalesTargetCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.Close();
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class CancelSalesTargetHandler : IRequestHandler<CancelSalesTargetCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public CancelSalesTargetHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(CancelSalesTargetCommand request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        var result = target.Cancel(request.Reason);
        if (!result.IsSuccess) return result;

        _unitOfWork.SalesTargets.Update(target);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

// Mapping helpers
internal static class SalesTargetMapper
{
    internal static SalesTargetDto MapToDto(SalesTarget t)
    {
        return new SalesTargetDto(
            t.Id, t.TargetCode, t.Name, t.Description,
            t.TargetType.ToString(), t.PeriodType.ToString(), t.Year,
            t.SalesRepresentativeId, t.SalesRepresentativeName,
            t.SalesTeamId, t.SalesTeamName,
            t.SalesTerritoryId, t.SalesTerritoryName,
            t.TotalTargetAmount.Amount, t.TotalActualAmount.Amount,
            t.TotalTargetAmount.Currency,
            t.MetricType.ToString(),
            t.TargetQuantity, t.ActualQuantity,
            t.MinimumAchievementPercentage,
            t.Status.ToString(),
            t.GetAchievementPercentage(),
            t.GetForecast().ToString(),
            t.ParentTargetId, t.Notes,
            t.Periods.Select(MapPeriodToDto).ToList(),
            t.ProductTargets.Select(MapProductToDto).ToList());
    }

    internal static SalesTargetListDto MapToListDto(SalesTarget t)
    {
        return new SalesTargetListDto(
            t.Id, t.TargetCode, t.Name,
            t.TargetType.ToString(), t.PeriodType.ToString(), t.Year,
            t.SalesRepresentativeName, t.SalesTeamName,
            t.TotalTargetAmount.Amount, t.TotalActualAmount.Amount,
            t.TotalTargetAmount.Currency,
            t.Status.ToString(),
            t.GetAchievementPercentage(),
            t.GetForecast().ToString());
    }

    private static SalesTargetPeriodDto MapPeriodToDto(SalesTargetPeriod p)
    {
        return new SalesTargetPeriodDto(
            p.Id, p.PeriodNumber, p.StartDate, p.EndDate,
            p.TargetAmount.Amount, p.ActualAmount.Amount,
            p.TargetAmount.Currency,
            p.TargetQuantity, p.ActualQuantity,
            p.GetAchievementPercentage());
    }

    private static SalesTargetProductDto MapProductToDto(SalesTargetProduct p)
    {
        return new SalesTargetProductDto(
            p.Id, p.ProductId, p.ProductCode, p.ProductName,
            p.TargetAmount.Amount, p.ActualAmount.Amount,
            p.TargetAmount.Currency,
            p.TargetQuantity, p.ActualQuantity,
            p.Weight, p.GetAchievementPercentage());
    }
}
