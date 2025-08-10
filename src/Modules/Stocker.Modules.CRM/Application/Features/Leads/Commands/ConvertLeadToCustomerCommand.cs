using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Leads.Commands;

/// <summary>
/// Command to convert a lead to a customer
/// </summary>
public class ConvertLeadToCustomerCommand : IRequest<Result<CustomerDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid LeadId { get; set; }
}

/// <summary>
/// Handler for ConvertLeadToCustomerCommand
/// </summary>
public class ConvertLeadToCustomerCommandHandler : IRequestHandler<ConvertLeadToCustomerCommand, Result<CustomerDto>>
{
    private readonly ILeadRepository _leadRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public ConvertLeadToCustomerCommandHandler(
        ILeadRepository leadRepository,
        ICustomerRepository customerRepository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _leadRepository = leadRepository;
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerDto>> Handle(ConvertLeadToCustomerCommand request, CancellationToken cancellationToken)
    {
        // Get the lead
        var lead = await _leadRepository.GetByIdAsync(request.LeadId, cancellationToken);

        if (lead == null)
        {
            return Result<CustomerDto>.Failure(Error.NotFound("Lead", "Lead not found"));
        }

        // Verify tenant access
        if (lead.TenantId != request.TenantId)
        {
            return Result<CustomerDto>.Failure(Error.Forbidden("Lead", "Access denied"));
        }

        // Check if customer with same email already exists
        var emailExists = await _customerRepository.ExistsWithEmailAsync(
            lead.Email,
            null,
            cancellationToken);

        if (emailExists)
        {
            return Result<CustomerDto>.Failure(
                Error.Conflict("Customer.Email", "A customer with this email already exists"));
        }

        // Convert lead to customer
        var customerResult = lead.ConvertToCustomer();

        if (customerResult.IsFailure)
        {
            return Result<CustomerDto>.Failure(customerResult.Error);
        }

        var customer = customerResult.Value;

        // Save the customer
        await _customerRepository.AddAsync(customer, cancellationToken);

        // Update the lead
        await _leadRepository.UpdateAsync(lead, cancellationToken);

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var customerDto = MapToDto(customer);

        return Result<CustomerDto>.Success(customerDto);
    }

    private static CustomerDto MapToDto(Domain.Entities.Customer customer)
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