using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Commands;

/// <summary>
/// Command to add an item to a payroll
/// </summary>
public record AddPayrollItemCommand : IRequest<Result<PayrollItemDto>>
{
    public int PayrollId { get; init; }
    public AddPayrollItemDto ItemData { get; init; } = null!;
}

/// <summary>
/// Validator for AddPayrollItemCommand
/// </summary>
public class AddPayrollItemCommandValidator : AbstractValidator<AddPayrollItemCommand>
{
    public AddPayrollItemCommandValidator()
    {
        RuleFor(x => x.PayrollId)
            .GreaterThan(0).WithMessage("Valid payroll ID is required");

        RuleFor(x => x.ItemData)
            .NotNull().WithMessage("Item data is required");

        When(x => x.ItemData != null, () =>
        {
            RuleFor(x => x.ItemData.ItemType)
                .NotEmpty().WithMessage("Item type is required")
                .MaximumLength(50).WithMessage("Item type must not exceed 50 characters");

            RuleFor(x => x.ItemData.ItemCode)
                .NotEmpty().WithMessage("Item code is required")
                .MaximumLength(20).WithMessage("Item code must not exceed 20 characters");

            RuleFor(x => x.ItemData.Description)
                .NotEmpty().WithMessage("Description is required")
                .MaximumLength(200).WithMessage("Description must not exceed 200 characters");

            RuleFor(x => x.ItemData.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0");
        });
    }
}

/// <summary>
/// Handler for AddPayrollItemCommand
/// </summary>
public class AddPayrollItemCommandHandler : IRequestHandler<AddPayrollItemCommand, Result<PayrollItemDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public AddPayrollItemCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollItemDto>> Handle(AddPayrollItemCommand request, CancellationToken cancellationToken)
    {
        var payroll = await _unitOfWork.Payrolls.GetByIdAsync(request.PayrollId, cancellationToken);
        if (payroll == null)
        {
            return Result<PayrollItemDto>.Failure(
                Error.NotFound("Payroll.NotFound", $"Payroll with ID {request.PayrollId} not found"));
        }

        if (payroll.Status != PayrollStatus.Draft)
        {
            return Result<PayrollItemDto>.Failure(
                Error.Validation("Payroll.InvalidStatus", "Items can only be added to draft payrolls"));
        }

        var data = request.ItemData;

        // Map DTO ItemType string to PayrollItemType enum
        PayrollItemType itemType;
        if (data.IsEmployerContribution)
            itemType = PayrollItemType.EmployerContribution;
        else if (data.IsDeduction)
            itemType = PayrollItemType.Deduction;
        else
            itemType = PayrollItemType.Earning;

        var item = new PayrollItem(
            request.PayrollId,
            data.ItemCode,
            data.Description,
            itemType,
            data.Amount,
            data.Quantity,
            data.Rate,
            false, // isRecurring - default to false
            data.IsTaxable,
            0); // displayOrder - default to 0

        item.SetTenantId(_unitOfWork.TenantId);

        payroll.AddItem(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PayrollItemDto
        {
            Id = item.Id,
            PayrollId = item.PayrollId,
            ItemType = item.ItemType.ToString(),
            ItemCode = item.Code,
            Description = item.Description,
            Amount = item.Amount,
            IsDeduction = item.ItemType == PayrollItemType.Deduction,
            IsEmployerContribution = item.ItemType == PayrollItemType.EmployerContribution,
            IsTaxable = item.IsTaxable,
            Quantity = item.Quantity,
            Rate = item.Rate
        };

        return Result<PayrollItemDto>.Success(dto);
    }
}
