using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;

public class AddCustomerTagCommand : IRequest<Result<CustomerTagDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public string Tag { get; set; } = string.Empty;
    public string? Color { get; set; }
    public Guid CreatedBy { get; set; }
}

public class AddCustomerTagCommandValidator : AbstractValidator<AddCustomerTagCommand>
{
    public AddCustomerTagCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Tag)
            .NotEmpty().WithMessage("Tag is required")
            .MaximumLength(100).WithMessage("Tag cannot exceed 100 characters");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}

public class AddCustomerTagCommandHandler : IRequestHandler<AddCustomerTagCommand, Result<CustomerTagDto>>
{
    private readonly CRMDbContext _context;

    public AddCustomerTagCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerTagDto>> Handle(AddCustomerTagCommand request, CancellationToken cancellationToken)
    {
        // Verify customer exists
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == request.CustomerId && c.TenantId == request.TenantId, cancellationToken);

        if (!customerExists)
        {
            return Result<CustomerTagDto>.Failure(
                Error.NotFound("Customer.NotFound", $"Customer with ID {request.CustomerId} not found"));
        }

        // Check if tag already exists for this customer
        var tagExists = await _context.CustomerTags
            .AnyAsync(t => t.CustomerId == request.CustomerId &&
                          t.Tag == request.Tag &&
                          t.TenantId == request.TenantId, cancellationToken);

        if (tagExists)
        {
            return Result<CustomerTagDto>.Failure(
                Error.Conflict("CustomerTag.Exists", $"Tag '{request.Tag}' already exists for this customer"));
        }

        var customerTag = new CustomerTag(
            request.TenantId,
            request.CustomerId,
            request.Tag,
            request.CreatedBy,
            request.Color);

        _context.CustomerTags.Add(customerTag);
        await _context.SaveChangesAsync(cancellationToken);

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
