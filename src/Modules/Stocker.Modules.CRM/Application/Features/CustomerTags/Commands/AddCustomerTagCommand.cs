using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;

public class AddCustomerTagCommand : IRequest<Result<CustomerTagDto>>
{
    public Guid CustomerId { get; set; }
    public string Tag { get; set; } = string.Empty;
    public string? Color { get; set; }
    public Guid CreatedBy { get; set; }
}

public class AddCustomerTagCommandValidator : AbstractValidator<AddCustomerTagCommand>
{
    public AddCustomerTagCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Tag)
            .NotEmpty().WithMessage("Tag is required")
            .MaximumLength(100).WithMessage("Tag cannot exceed 100 characters");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class AddCustomerTagCommandHandler : IRequestHandler<AddCustomerTagCommand, Result<CustomerTagDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public AddCustomerTagCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerTagDto>> Handle(AddCustomerTagCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        // Verify customer exists
        var customerExists = await _unitOfWork.ReadRepository<Customer>().AsQueryable()
            .AnyAsync(c => c.Id == request.CustomerId && c.TenantId == tenantId, cancellationToken);

        if (!customerExists)
        {
            return Result<CustomerTagDto>.Failure(
                Error.NotFound("Customer.NotFound", $"Customer with ID {request.CustomerId} not found"));
        }

        // Check if tag already exists for this customer
        var tagExists = await _unitOfWork.ReadRepository<CustomerTag>().AsQueryable()
            .AnyAsync(t => t.CustomerId == request.CustomerId &&
                          t.Tag == request.Tag &&
                          t.TenantId == tenantId, cancellationToken);

        if (tagExists)
        {
            return Result<CustomerTagDto>.Failure(
                Error.Conflict("CustomerTag.Exists", $"Tag '{request.Tag}' already exists for this customer"));
        }

        var customerTag = new CustomerTag(
            tenantId,
            request.CustomerId,
            request.Tag,
            request.CreatedBy,
            request.Color);

        await _unitOfWork.Repository<CustomerTag>().AddAsync(customerTag);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new CustomerTagDto
        {
            Id = customerTag.Id,
            TenantId = customerTag.TenantId,
            CustomerId = customerTag.CustomerId,
            Tag = customerTag.Tag,
            Color = customerTag.Color,
            CreatedBy = customerTag.CreatedBy
        };

        return Result<CustomerTagDto>.Success(dto);
    }
}
