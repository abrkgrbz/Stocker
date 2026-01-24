using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerSegments.Handlers;

public class CreateCustomerSegmentHandler : IRequestHandler<CreateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public CreateCustomerSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<CustomerSegmentDto>> Handle(CreateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        if (!Enum.TryParse<SegmentPriority>(dto.Priority, true, out var priority))
            return Result<CustomerSegmentDto>.Failure(Error.Validation("Segment.Priority", "Geçersiz öncelik."));

        var existing = await _unitOfWork.CustomerSegments.GetByCodeAsync(dto.Code, cancellationToken);
        if (existing != null)
            return Result<CustomerSegmentDto>.Failure(Error.Conflict("Segment.CodeExists", "Bu kod zaten kullanılmakta."));

        var result = CustomerSegment.Create(_unitOfWork.TenantId, dto.Code, dto.Name, priority);
        if (!result.IsSuccess)
            return Result<CustomerSegmentDto>.Failure(result.Error);

        var segment = result.Value!;
        if (!string.IsNullOrWhiteSpace(dto.Description))
            segment.UpdateDetails(null, dto.Description);

        await _unitOfWork.CustomerSegments.AddAsync(segment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<CustomerSegmentDto>.Success(CustomerSegmentMapper.MapToDto(segment));
    }
}

public class SetSegmentPricingHandler : IRequestHandler<SetSegmentPricingCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentPricingHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentPricingCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.SetPricing(request.Dto.DiscountPercentage, request.Dto.MinimumOrderAmount, request.Dto.MaximumOrderAmount);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetSegmentCreditTermsHandler : IRequestHandler<SetSegmentCreditTermsCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentCreditTermsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentCreditTermsCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.SetCreditTerms(request.Dto.CreditLimit, request.Dto.PaymentTermDays, request.Dto.RequiresAdvancePayment, request.Dto.AdvancePaymentPercentage);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetSegmentServiceLevelHandler : IRequestHandler<SetSegmentServiceLevelCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentServiceLevelHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentServiceLevelCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        if (!Enum.TryParse<SegmentPriority>(request.Dto.Priority, true, out var priority))
            return Result.Failure(Error.Validation("Segment.Priority", "Geçersiz öncelik."));

        if (!Enum.TryParse<ServiceLevel>(request.Dto.ServiceLevel, true, out var serviceLevel))
            return Result.Failure(Error.Validation("Segment.ServiceLevel", "Geçersiz hizmet seviyesi."));

        var result = segment.SetServiceLevel(priority, serviceLevel, request.Dto.MaxResponseTimeHours, request.Dto.DedicatedSupport);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetSegmentEligibilityHandler : IRequestHandler<SetSegmentEligibilityCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentEligibilityHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentEligibilityCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.SetEligibilityCriteria(request.Dto.MinimumAnnualRevenue, request.Dto.MinimumOrderCount, request.Dto.MinimumMonthsAsCustomer);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetSegmentBenefitsHandler : IRequestHandler<SetSegmentBenefitsCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentBenefitsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentBenefitsCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var dto = request.Dto;
        segment.SetShippingBenefits(dto.FreeShipping, dto.FreeShippingThreshold);
        segment.SetPromotionalBenefits(dto.EarlyAccessToProducts, dto.ExclusivePromotions, dto.BenefitsDescription);

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetSegmentVisualHandler : IRequestHandler<SetSegmentVisualCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetSegmentVisualHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetSegmentVisualCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        segment.SetVisual(request.Dto.Color, request.Dto.BadgeIcon);

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class UpdateSegmentDetailsHandler : IRequestHandler<UpdateSegmentDetailsCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public UpdateSegmentDetailsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(UpdateSegmentDetailsCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        segment.UpdateDetails(request.Dto.Name, request.Dto.Description);

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AssignCustomerHandler : IRequestHandler<AssignCustomerCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public AssignCustomerHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(AssignCustomerCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.AssignCustomer(request.Dto.CustomerId);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class RemoveCustomerFromSegmentHandler : IRequestHandler<RemoveCustomerFromSegmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public RemoveCustomerFromSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(RemoveCustomerFromSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.RemoveCustomer(request.CustomerId);
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetDefaultSegmentHandler : IRequestHandler<SetDefaultSegmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public SetDefaultSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(SetDefaultSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        // Clear other defaults
        var currentDefault = await _unitOfWork.CustomerSegments.GetDefaultAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != segment.Id)
        {
            currentDefault.ClearDefault();
            _unitOfWork.CustomerSegments.Update(currentDefault);
        }

        segment.SetAsDefault();
        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class ActivateSegmentHandler : IRequestHandler<ActivateSegmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public ActivateSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(ActivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        segment.Activate();
        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class DeactivateSegmentHandler : IRequestHandler<DeactivateSegmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public DeactivateSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(DeactivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        var result = segment.Deactivate();
        if (!result.IsSuccess) return result;

        _unitOfWork.CustomerSegments.Update(segment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

// Mapping helpers
internal static class CustomerSegmentMapper
{
    internal static CustomerSegmentDto MapToDto(CustomerSegment s)
    {
        return new CustomerSegmentDto(
            s.Id, s.Code, s.Name, s.Description,
            s.DiscountPercentage, s.MinimumOrderAmount, s.MaximumOrderAmount,
            s.AllowSpecialPricing,
            s.DefaultCreditLimit, s.DefaultPaymentTermDays,
            s.RequiresAdvancePayment, s.AdvancePaymentPercentage,
            s.Priority.ToString(), s.ServiceLevel.ToString(),
            s.MaxResponseTimeHours, s.HasDedicatedSupport,
            s.MinimumAnnualRevenue, s.MinimumOrderCount, s.MinimumMonthsAsCustomer,
            s.FreeShipping, s.FreeShippingThreshold,
            s.EarlyAccessToProducts, s.ExclusivePromotions,
            s.BenefitsDescription,
            s.Color, s.BadgeIcon,
            s.IsActive, s.IsDefault,
            s.CustomerCount, s.TotalRevenue, s.AverageOrderValue);
    }

    internal static CustomerSegmentListDto MapToListDto(CustomerSegment s)
    {
        return new CustomerSegmentListDto(
            s.Id, s.Code, s.Name,
            s.Priority.ToString(), s.ServiceLevel.ToString(),
            s.DiscountPercentage,
            s.IsActive, s.IsDefault,
            s.CustomerCount, s.Color, s.BadgeIcon);
    }
}
