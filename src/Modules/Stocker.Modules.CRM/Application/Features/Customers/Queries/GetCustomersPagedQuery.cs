using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Repositories;
// using Stocker.SharedKernel.Extensions; // TODO: Add extensions or refactor
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Customers.Queries;

/// <summary>
/// Query to get paginated customers
/// </summary>
public class GetCustomersPagedQuery : PaginationRequest, IRequest<Result<PagedResult<CustomerDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public string? Industry { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}

/// <summary>
/// Handler for GetCustomersPagedQuery
/// </summary>
public class GetCustomersPagedQueryHandler : IRequestHandler<GetCustomersPagedQuery, Result<PagedResult<CustomerDto>>>
{
    private readonly ICustomerRepository _customerRepository;

    public GetCustomersPagedQueryHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<PagedResult<CustomerDto>>> Handle(GetCustomersPagedQuery request, CancellationToken cancellationToken)
    {
        // Use IQueryable instead of IIncludableQueryable to avoid type conversion issues
        IQueryable<Domain.Entities.Customer> query = _customerRepository.AsQueryable()
            .Include(c => c.Contacts);
        
        // Apply filters (WhereIf extension not available - using standard Where)
        if (!request.IncludeInactive)
            query = query.Where(c => c.IsActive);
        
        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(c => 
                c.CompanyName.Contains(request.SearchTerm!) ||
                c.Email.Contains(request.SearchTerm!) ||
                c.City.Contains(request.SearchTerm!));
        
        if (!string.IsNullOrEmpty(request.Industry))
            query = query.Where(c => c.Industry == request.Industry);
        
        if (!string.IsNullOrEmpty(request.City))
            query = query.Where(c => c.City == request.City);
        
        if (!string.IsNullOrEmpty(request.Country))
            query = query.Where(c => c.Country == request.Country);

        // Apply sorting
        if (!string.IsNullOrEmpty(request.SortBy))
        {
            // OrderByProperty extension not available - using manual sorting
            query = request.SortBy.ToLower() switch
            {
                "companyname" => request.SortDescending ? query.OrderByDescending(c => c.CompanyName) : query.OrderBy(c => c.CompanyName),
                "email" => request.SortDescending ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email),
                "city" => request.SortDescending ? query.OrderByDescending(c => c.City) : query.OrderBy(c => c.City),
                "country" => request.SortDescending ? query.OrderByDescending(c => c.Country) : query.OrderBy(c => c.Country),
                _ => query.OrderBy(c => c.CompanyName)
            };
        }
        else
        {
            query = query.OrderBy(c => c.CompanyName);
        }

        // Get paged results (ToPagedResultAsync extension not available - using manual paging)
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        
        var pagedResult = PagedResult<Domain.Entities.Customer>.Create(items, totalCount, request.PageNumber, request.PageSize);

        // Map to DTOs
        var customerDtos = pagedResult.Items.Select(MapToDto).ToList();
        var pagedDtoResult = PagedResult<CustomerDto>.Create(
            customerDtos,
            pagedResult.TotalCount,
            pagedResult.PageNumber,
            pagedResult.PageSize);

        return Result<PagedResult<CustomerDto>>.Success(pagedDtoResult);
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