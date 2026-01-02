using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Customers.Commands;

/// <summary>
/// Command to delete a customer
/// </summary>
public class DeleteCustomerCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public bool ForceDelete { get; set; } = false;
}

/// <summary>
/// Validator for DeleteCustomerCommand
/// </summary>
public class DeleteCustomerCommandValidator : AbstractValidator<DeleteCustomerCommand>
{
    public DeleteCustomerCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}

/// <summary>
/// Handler for DeleteCustomerCommand
/// </summary>
public class DeleteCustomerCommandHandler : IRequestHandler<DeleteCustomerCommand, Result>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteCustomerCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        // Get the customer using ICRMUnitOfWork to ensure same DbContext is used for both read and save
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken);

        if (customer == null)
        {
            return Result.Failure(
                Error.NotFound("Customer.NotFound", $"Customer with ID {request.CustomerId} not found"));
        }

        // Check if customer belongs to the tenant
        if (customer.TenantId != request.TenantId)
        {
            return Result.Failure(
                Error.Forbidden("Customer.Forbidden", "You don't have permission to delete this customer"));
        }

        // Check if customer has related data (deals, activities, etc.)
        // This would normally check for related entities
        // For now, we'll implement soft delete by default unless ForceDelete is true

        if (request.ForceDelete)
        {
            // Hard delete - permanently remove from database
            _unitOfWork.Customers.Remove(customer);
        }
        else
        {
            // Soft delete - mark as inactive
            customer.Deactivate();
            await _unitOfWork.Customers.UpdateAsync(customer, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}