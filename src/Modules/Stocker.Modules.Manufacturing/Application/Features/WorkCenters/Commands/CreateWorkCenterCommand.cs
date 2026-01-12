using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Commands;

public record CreateWorkCenterCommand(CreateWorkCenterRequest Request) : IRequest<WorkCenterDto>;

public class CreateWorkCenterCommandValidator : AbstractValidator<CreateWorkCenterCommand>
{
    public CreateWorkCenterCommandValidator()
    {
        RuleFor(x => x.Request.Code)
            .NotEmpty().WithMessage("İş merkezi kodu zorunludur.")
            .MinimumLength(2).WithMessage("İş merkezi kodu en az 2 karakter olmalıdır.")
            .MaximumLength(20).WithMessage("İş merkezi kodu en fazla 20 karakter olabilir.")
            .Matches(@"^[\p{L}\p{N}\-_]+$").WithMessage("İş merkezi kodu sadece harf, rakam, tire ve alt çizgi içerebilir.");

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

        RuleFor(x => x.Request.HourlyLaborCost)
            .GreaterThanOrEqualTo(0).WithMessage("Saatlik işçilik maliyeti negatif olamaz.");

        RuleFor(x => x.Request.HourlyMachineCost)
            .GreaterThanOrEqualTo(0).WithMessage("Saatlik makine maliyeti negatif olamaz.");

        RuleFor(x => x.Request.OEETarget)
            .InclusiveBetween(0, 100).WithMessage("OEE hedefi 0-100 arasında olmalıdır.");
    }
}

public class CreateWorkCenterCommandHandler : IRequestHandler<CreateWorkCenterCommand, WorkCenterDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateWorkCenterCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<WorkCenterDto> Handle(CreateWorkCenterCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");
        var request = command.Request;

        if (await _unitOfWork.WorkCenters.ExistsAsync(tenantId, request.Code, cancellationToken))
            throw new InvalidOperationException($"'{request.Code}' kodlu iş merkezi zaten mevcut.");

        var workCenterType = Enum.Parse<WorkCenterType>(request.Type, true);
        var workCenter = new WorkCenter(request.Code, request.Name, workCenterType);

        workCenter.UpdateBasicInfo(request.Name, request.Description, workCenterType);
        workCenter.SetCapacity(request.Capacity, request.CapacityUnit, request.EfficiencyRate);
        workCenter.SetCosts(request.HourlyMachineCost, request.HourlyLaborCost, request.HourlyOverheadCost);
        workCenter.SetOEETarget(request.OEETarget);

        if (!string.IsNullOrEmpty(request.CostCenterId))
            workCenter.SetCostCenter(request.CostCenterId);

        await _unitOfWork.WorkCenters.AddAsync(workCenter, cancellationToken);
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
