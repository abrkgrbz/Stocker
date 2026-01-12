using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Commands;

public record UpdateWorkCenterCommand(int Id, UpdateWorkCenterRequest Request) : IRequest<WorkCenterDto>;

public class UpdateWorkCenterCommandValidator : AbstractValidator<UpdateWorkCenterCommand>
{
    public UpdateWorkCenterCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");

        RuleFor(x => x.Request.Name)
            .NotEmpty().WithMessage("İş merkezi adı zorunludur.")
            .MinimumLength(2).WithMessage("İş merkezi adı en az 2 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("İş merkezi adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Request.Type)
            .NotEmpty().WithMessage("İş merkezi tipi zorunludur.");

        RuleFor(x => x.Request.Capacity)
            .GreaterThan(0).WithMessage("Kapasite sıfırdan büyük olmalıdır.");

        RuleFor(x => x.Request.EfficiencyRate)
            .InclusiveBetween(0, 100).WithMessage("Verimlilik oranı 0-100 arasında olmalıdır.");
    }
}

public class UpdateWorkCenterCommandHandler : IRequestHandler<UpdateWorkCenterCommand, WorkCenterDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public UpdateWorkCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkCenterDto> Handle(UpdateWorkCenterCommand command, CancellationToken cancellationToken)
    {
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("İş merkezi bulunamadı.");

        var request = command.Request;
        var workCenterType = Enum.Parse<WorkCenterType>(request.Type, true);

        workCenter.UpdateBasicInfo(request.Name, request.Description, workCenterType);
        workCenter.SetCapacity(request.Capacity, request.CapacityUnit, request.EfficiencyRate);
        workCenter.SetCosts(request.HourlyMachineCost, request.HourlyLaborCost, request.HourlyOverheadCost);
        workCenter.SetOEETarget(request.OEETarget);

        if (!string.IsNullOrEmpty(request.CostCenterId))
            workCenter.SetCostCenter(request.CostCenterId);

        _unitOfWork.WorkCenters.Update(workCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(workCenter);
    }

    private static WorkCenterDto MapToDto(WorkCenter entity) => new(
        entity.Id,
        entity.Code,
        entity.Name,
        entity.Description,
        entity.Type.ToString(),
        entity.Status.ToString(),
        entity.Capacity,
        entity.CapacityUnit,
        entity.EfficiencyRate,
        entity.HourlyLaborCost,
        entity.HourlyMachineCost,
        entity.HourlyOverheadCost,
        entity.TotalHourlyCost,
        entity.OEETarget,
        entity.LastOEE,
        entity.CostCenterId,
        entity.IsActive,
        entity.CreatedDate,
        entity.UpdatedDate);
}
