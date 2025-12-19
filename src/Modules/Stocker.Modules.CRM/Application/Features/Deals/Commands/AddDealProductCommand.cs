using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

/// <summary>
/// Command to add a product to a deal
/// </summary>
public class AddDealProductCommand : IRequest<Result<DealProductDto>>
{
    public Guid DealId { get; set; }
    public CreateDealProductDto ProductData { get; set; } = null!;
}

/// <summary>
/// Validator for AddDealProductCommand
/// </summary>
public class AddDealProductCommandValidator : AbstractValidator<AddDealProductCommand>
{
    public AddDealProductCommandValidator()
    {
        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ProductData)
            .NotNull().WithMessage("Product data is required");

        When(x => x.ProductData != null, () =>
        {
            RuleFor(x => x.ProductData.ProductName)
                .NotEmpty().WithMessage("Product name is required")
                .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

            RuleFor(x => x.ProductData.ProductCode)
                .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

            RuleFor(x => x.ProductData.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

            RuleFor(x => x.ProductData.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than 0");

            RuleFor(x => x.ProductData.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Unit price must be greater than or equal to 0");

            RuleFor(x => x.ProductData.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .MaximumLength(3).WithMessage("Currency must be a 3-letter code");

            RuleFor(x => x.ProductData.DiscountPercent)
                .InclusiveBetween(0, 100).WithMessage("Discount percent must be between 0 and 100");

            RuleFor(x => x.ProductData.DiscountAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Discount amount must be greater than or equal to 0");

            RuleFor(x => x.ProductData.Tax)
                .InclusiveBetween(0, 100).WithMessage("Tax must be between 0 and 100");

            RuleFor(x => x.ProductData.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be greater than or equal to 0");

            RuleFor(x => x.ProductData.RecurringPeriod)
                .MaximumLength(50).WithMessage("Recurring period must not exceed 50 characters")
                .When(x => x.ProductData.IsRecurring);

            RuleFor(x => x.ProductData.RecurringCycles)
                .GreaterThan(0).WithMessage("Recurring cycles must be greater than 0")
                .When(x => x.ProductData.IsRecurring && x.ProductData.RecurringCycles.HasValue);
        });
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class AddDealProductCommandHandler : IRequestHandler<AddDealProductCommand, Result<DealProductDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public AddDealProductCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DealProductDto>> Handle(AddDealProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == tenantId, cancellationToken);

        if (deal == null)
            return Result<DealProductDto>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var unitPrice = Money.Create(request.ProductData.UnitPrice, request.ProductData.Currency);

        var dealProduct = new DealProduct(
            tenantId,
            request.DealId,
            request.ProductData.ProductId,
            request.ProductData.ProductName,
            request.ProductData.Quantity,
            unitPrice,
            request.ProductData.Tax,
            request.ProductData.SortOrder);

        if (!string.IsNullOrEmpty(request.ProductData.ProductCode))
            dealProduct.SetProductCode(request.ProductData.ProductCode);

        if (!string.IsNullOrEmpty(request.ProductData.Description))
            dealProduct.SetDescription(request.ProductData.Description);

        if (request.ProductData.DiscountPercent > 0)
            dealProduct.ApplyDiscountPercent(request.ProductData.DiscountPercent);

        if (request.ProductData.IsRecurring && !string.IsNullOrEmpty(request.ProductData.RecurringPeriod))
            dealProduct.SetAsRecurring(request.ProductData.RecurringPeriod, request.ProductData.RecurringCycles);

        deal.AddProduct(dealProduct);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new DealProductDto
        {
            Id = dealProduct.Id,
            ProductId = dealProduct.ProductId,
            ProductName = dealProduct.ProductName,
            ProductCode = dealProduct.ProductCode,
            Description = dealProduct.Description,
            Quantity = dealProduct.Quantity,
            UnitPrice = dealProduct.UnitPrice.Amount,
            Currency = dealProduct.UnitPrice.Currency,
            DiscountPercent = dealProduct.DiscountPercent,
            DiscountAmount = dealProduct.DiscountAmount.Amount,
            TotalPrice = dealProduct.TotalPrice.Amount,
            Tax = dealProduct.Tax,
            TaxAmount = dealProduct.TaxAmount.Amount,
            SortOrder = dealProduct.SortOrder,
            IsRecurring = dealProduct.IsRecurring,
            RecurringPeriod = dealProduct.RecurringPeriod,
            RecurringCycles = dealProduct.RecurringCycles
        };

        return Result<DealProductDto>.Success(dto);
    }
}
