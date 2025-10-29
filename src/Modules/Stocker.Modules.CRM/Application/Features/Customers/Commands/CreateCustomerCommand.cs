using FluentValidation;
using MassTransit;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Events.CRM;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Customers.Commands;

/// <summary>
/// Command to create a new customer
/// </summary>
public class CreateCustomerCommand : IRequest<Result<CustomerDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCustomerDto CustomerData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateCustomerCommand
/// </summary>
public class CreateCustomerCommandValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.CustomerData)
            .NotNull().WithMessage("Customer data is required");

        When(x => x.CustomerData != null, () =>
        {
            RuleFor(x => x.CustomerData.CompanyName)
                .NotEmpty().WithMessage("Company name is required")
                .MaximumLength(200).WithMessage("Company name must not exceed 200 characters");

            RuleFor(x => x.CustomerData.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            RuleFor(x => x.CustomerData.Phone)
                .MaximumLength(50).WithMessage("Phone must not exceed 50 characters");

            RuleFor(x => x.CustomerData.Website)
                .MaximumLength(255).WithMessage("Website must not exceed 255 characters");

            RuleFor(x => x.CustomerData.Industry)
                .MaximumLength(100).WithMessage("Industry must not exceed 100 characters");

            RuleFor(x => x.CustomerData.AnnualRevenue)
                .GreaterThanOrEqualTo(0).When(x => x.CustomerData.AnnualRevenue.HasValue)
                .WithMessage("Annual revenue cannot be negative");

            RuleFor(x => x.CustomerData.NumberOfEmployees)
                .GreaterThanOrEqualTo(0).When(x => x.CustomerData.NumberOfEmployees.HasValue)
                .WithMessage("Number of employees cannot be negative");
        });
    }
}

/// <summary>
/// Handler for CreateCustomerCommand
/// </summary>
public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, Result<CustomerDto>>
{
    private readonly ICustomerRepository _customerRepository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateCustomerCommandHandler(
        ICustomerRepository customerRepository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork,
        IPublishEndpoint publishEndpoint)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<CustomerDto>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        // Check if customer with same email already exists
        var emailExists = await _customerRepository.ExistsWithEmailAsync(
            request.CustomerData.Email, 
            null, 
            cancellationToken);

        if (emailExists)
        {
            return Result<CustomerDto>.Failure(
                Error.Conflict("Customer.Email", "A customer with this email already exists"));
        }

        // Create the customer
        var customerResult = Customer.Create(
            request.TenantId,
            request.CustomerData.CompanyName,
            request.CustomerData.Email,
            request.CustomerData.Phone,
            request.CustomerData.Website,
            request.CustomerData.Industry);

        if (customerResult.IsFailure)
        {
            return Result<CustomerDto>.Failure(customerResult.Error);
        }

        var customer = customerResult.Value;

        // Update additional information
        if (!string.IsNullOrEmpty(request.CustomerData.Address) ||
            !string.IsNullOrEmpty(request.CustomerData.City) ||
            !string.IsNullOrEmpty(request.CustomerData.State) ||
            !string.IsNullOrEmpty(request.CustomerData.Country) ||
            !string.IsNullOrEmpty(request.CustomerData.PostalCode))
        {
            customer.UpdateAddress(
                request.CustomerData.Address,
                request.CustomerData.City,
                request.CustomerData.State,
                request.CustomerData.Country,
                request.CustomerData.PostalCode);
        }

        if (request.CustomerData.AnnualRevenue.HasValue ||
            request.CustomerData.NumberOfEmployees.HasValue ||
            !string.IsNullOrEmpty(request.CustomerData.Description))
        {
            customer.UpdateBusinessInfo(
                request.CustomerData.AnnualRevenue,
                request.CustomerData.NumberOfEmployees,
                request.CustomerData.Description);
        }

        // Update financial information
        if (request.CustomerData.CustomerType.HasValue ||
            request.CustomerData.Status.HasValue ||
            request.CustomerData.CreditLimit.HasValue ||
            !string.IsNullOrEmpty(request.CustomerData.TaxId) ||
            !string.IsNullOrEmpty(request.CustomerData.PaymentTerms) ||
            !string.IsNullOrEmpty(request.CustomerData.ContactPerson))
        {
            customer.UpdateFinancialInfo(
                request.CustomerData.CustomerType,
                request.CustomerData.Status,
                request.CustomerData.CreditLimit,
                request.CustomerData.TaxId,
                request.CustomerData.PaymentTerms,
                request.CustomerData.ContactPerson);
        }

        // Save to repository
        await _customerRepository.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish integration event
        var integrationEvent = new CustomerCreatedEvent(
            CustomerId: customer.Id,
            TenantId: customer.TenantId,
            CompanyName: customer.CompanyName,
            Email: customer.Email,
            Phone: customer.Phone,
            Website: customer.Website,
            Industry: customer.Industry,
            AnnualRevenue: customer.AnnualRevenue,
            NumberOfEmployees: customer.NumberOfEmployees,
            CreatedAt: customer.CreatedAt,
            CreatedBy: Guid.Empty // TODO: Get from current user context
        );

        await _publishEndpoint.Publish(integrationEvent, cancellationToken);

        // Map to DTO
        var customerDto = MapToDto(customer);

        return Result<CustomerDto>.Success(customerDto);
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            CompanyName = customer.CompanyName,
            Email = customer.Email,
            Phone = customer.Phone,
            Website = customer.Website,
            Industry = customer.Industry,
            Address = customer.Address,
            City = customer.City,
            State = customer.State,
            Country = customer.Country,
            PostalCode = customer.PostalCode,
            AnnualRevenue = customer.AnnualRevenue,
            NumberOfEmployees = customer.NumberOfEmployees,
            Description = customer.Description,
            CustomerType = customer.CustomerType,
            Status = customer.Status,
            CreditLimit = customer.CreditLimit,
            TaxId = customer.TaxId,
            PaymentTerms = customer.PaymentTerms,
            ContactPerson = customer.ContactPerson,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt,
            Contacts = customer.Contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                CustomerId = c.CustomerId,
                FirstName = c.FirstName,
                LastName = c.LastName,
                FullName = c.FullName,
                Email = c.Email,
                Phone = c.Phone,
                MobilePhone = c.MobilePhone,
                JobTitle = c.JobTitle,
                Department = c.Department,
                IsPrimary = c.IsPrimary,
                IsActive = c.IsActive,
                Notes = c.Notes,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList()
        };
    }
}