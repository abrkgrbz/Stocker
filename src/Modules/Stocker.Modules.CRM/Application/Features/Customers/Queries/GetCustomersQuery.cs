using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Customers.Queries;

/// <summary>
/// Query to get all customers
/// </summary>
public class GetCustomersQuery : IRequest<Result<List<CustomerDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

/// <summary>
/// Handler for GetCustomersQuery
/// </summary>
public class GetCustomersQueryHandler : IRequestHandler<GetCustomersQuery, Result<List<CustomerDto>>>
{
    private readonly ICustomerRepository _customerRepository;

    public GetCustomersQueryHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<List<CustomerDto>>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = request.IncludeInactive
            ? await _customerRepository.GetAllAsync(cancellationToken)
            : await _customerRepository.GetActiveCustomersAsync(cancellationToken);

        var customerDtos = customers.Select(MapToDto).ToList();

        return Result<List<CustomerDto>>.Success(customerDtos);
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
            CountryId = customer.CountryId,
            CityId = customer.CityId,
            DistrictId = customer.DistrictId,
            Country = customer.Country,
            City = customer.City,
            District = customer.District,
            State = customer.State,
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
            KvkkDataProcessingConsent = customer.KvkkDataProcessingConsent,
            KvkkMarketingConsent = customer.KvkkMarketingConsent,
            KvkkCommunicationConsent = customer.KvkkCommunicationConsent,
            KvkkConsentDate = customer.KvkkConsentDate,
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

/// <summary>
/// Query to get a customer by ID
/// </summary>
public class GetCustomerByIdQuery : IRequest<Result<CustomerDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
}

/// <summary>
/// Handler for GetCustomerByIdQuery
/// </summary>
public class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, Result<CustomerDto>>
{
    private readonly ICustomerRepository _customerRepository;

    public GetCustomerByIdQueryHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<CustomerDto>> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetWithContactsAsync(request.CustomerId, cancellationToken);

        if (customer == null)
        {
            return Result<CustomerDto>.Failure(Error.NotFound("Customer", "Customer not found"));
        }

        // Verify tenant access
        if (customer.TenantId != request.TenantId)
        {
            return Result<CustomerDto>.Failure(Error.Forbidden("Customer", "Access denied"));
        }

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
            CountryId = customer.CountryId,
            CityId = customer.CityId,
            DistrictId = customer.DistrictId,
            Country = customer.Country,
            City = customer.City,
            District = customer.District,
            State = customer.State,
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
            KvkkDataProcessingConsent = customer.KvkkDataProcessingConsent,
            KvkkMarketingConsent = customer.KvkkMarketingConsent,
            KvkkCommunicationConsent = customer.KvkkCommunicationConsent,
            KvkkConsentDate = customer.KvkkConsentDate,
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