using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesCustomers.Queries;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesCustomers.Handlers;

public class GetSalesCustomerByIdQueryHandler : IRequestHandler<GetSalesCustomerByIdQuery, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesCustomerByIdQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesCustomerDto>> Handle(GetSalesCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                new Error("Customer.NotFound", $"Customer with ID '{request.Id}' not found", ErrorType.NotFound));
        }

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class GetSalesCustomerByCodeQueryHandler : IRequestHandler<GetSalesCustomerByCodeQuery, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesCustomerByCodeQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesCustomerDto>> Handle(GetSalesCustomerByCodeQuery request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CustomerCode == request.CustomerCode, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                new Error("Customer.NotFound", $"Customer with code '{request.CustomerCode}' not found", ErrorType.NotFound));
        }

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class GetSalesCustomerByTaxNumberQueryHandler : IRequestHandler<GetSalesCustomerByTaxNumberQuery, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesCustomerByTaxNumberQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesCustomerDto>> Handle(GetSalesCustomerByTaxNumberQuery request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.TaxNumber == request.TaxNumber, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                new Error("Customer.NotFound", $"Customer with tax number '{request.TaxNumber}' not found", ErrorType.NotFound));
        }

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class GetSalesCustomerByIdentityNumberQueryHandler : IRequestHandler<GetSalesCustomerByIdentityNumberQuery, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;

    public GetSalesCustomerByIdentityNumberQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SalesCustomerDto>> Handle(GetSalesCustomerByIdentityNumberQuery request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdentityNumber == request.IdentityNumber, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                new Error("Customer.NotFound", $"Customer with identity number '{request.IdentityNumber}' not found", ErrorType.NotFound));
        }

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class GetAllSalesCustomersQueryHandler : IRequestHandler<GetAllSalesCustomersQuery, Result<List<SalesCustomerListDto>>>
{
    private readonly SalesDbContext _context;

    public GetAllSalesCustomersQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesCustomerListDto>>> Handle(GetAllSalesCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers.AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        var customers = await query
            .OrderBy(c => c.CustomerCode)
            .Select(c => SalesCustomerListDto.FromEntity(c))
            .ToListAsync(cancellationToken);

        return Result<List<SalesCustomerListDto>>.Success(customers);
    }
}

public class GetSalesCustomersPagedQueryHandler : IRequestHandler<GetSalesCustomersPagedQuery, Result<PagedResult<SalesCustomerListDto>>>
{
    private readonly SalesDbContext _context;

    public GetSalesCustomersPagedQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<SalesCustomerListDto>>> Handle(GetSalesCustomersPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers.AsNoTracking();

        // Filter by active status
        if (!request.IncludeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        // Filter by customer type
        if (request.CustomerType.HasValue)
        {
            query = query.Where(c => c.CustomerType == request.CustomerType.Value);
        }

        // Filter by e-invoice status
        if (request.IsEInvoiceRegistered.HasValue)
        {
            query = query.Where(c => c.IsEInvoiceRegistered == request.IsEInvoiceRegistered.Value);
        }

        // Filter by city
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(c => c.City != null && c.City.Contains(request.City));
        }

        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.CustomerCode.ToLower().Contains(term) ||
                (c.CompanyName != null && c.CompanyName.ToLower().Contains(term)) ||
                (c.FirstName != null && c.FirstName.ToLower().Contains(term)) ||
                (c.LastName != null && c.LastName.ToLower().Contains(term)) ||
                (c.TaxNumber != null && c.TaxNumber.Contains(term)) ||
                (c.IdentityNumber != null && c.IdentityNumber.Contains(term)) ||
                (c.Email != null && c.Email.ToLower().Contains(term)) ||
                (c.Phone != null && c.Phone.Contains(term)));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "customercode" => request.SortDescending ? query.OrderByDescending(c => c.CustomerCode) : query.OrderBy(c => c.CustomerCode),
            "companyname" => request.SortDescending ? query.OrderByDescending(c => c.CompanyName) : query.OrderBy(c => c.CompanyName),
            "city" => request.SortDescending ? query.OrderByDescending(c => c.City) : query.OrderBy(c => c.City),
            "createdat" => request.SortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderBy(c => c.CustomerCode)
        };

        // Apply pagination
        var customers = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => SalesCustomerListDto.FromEntity(c))
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<SalesCustomerListDto>(
            customers,
            totalCount,
            request.PageNumber,
            request.PageSize);

        return Result<PagedResult<SalesCustomerListDto>>.Success(pagedResult);
    }
}

public class SearchSalesCustomersQueryHandler : IRequestHandler<SearchSalesCustomersQuery, Result<List<SalesCustomerListDto>>>
{
    private readonly SalesDbContext _context;

    public SearchSalesCustomersQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesCustomerListDto>>> Handle(SearchSalesCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers.AsNoTracking();

        if (request.OnlyActive)
        {
            query = query.Where(c => c.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.CustomerCode.ToLower().Contains(term) ||
                (c.CompanyName != null && c.CompanyName.ToLower().Contains(term)) ||
                (c.FirstName != null && c.FirstName.ToLower().Contains(term)) ||
                (c.LastName != null && c.LastName.ToLower().Contains(term)) ||
                (c.TaxNumber != null && c.TaxNumber.Contains(term)) ||
                (c.IdentityNumber != null && c.IdentityNumber.Contains(term)));
        }

        var customers = await query
            .OrderBy(c => c.CustomerCode)
            .Take(request.MaxResults)
            .Select(c => SalesCustomerListDto.FromEntity(c))
            .ToListAsync(cancellationToken);

        return Result<List<SalesCustomerListDto>>.Success(customers);
    }
}

public class GetEInvoiceCustomersQueryHandler : IRequestHandler<GetEInvoiceCustomersQuery, Result<List<SalesCustomerListDto>>>
{
    private readonly SalesDbContext _context;

    public GetEInvoiceCustomersQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SalesCustomerListDto>>> Handle(GetEInvoiceCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers
            .AsNoTracking()
            .Where(c => c.IsEInvoiceRegistered);

        if (request.OnlyActive)
        {
            query = query.Where(c => c.IsActive);
        }

        var customers = await query
            .OrderBy(c => c.CustomerCode)
            .Select(c => SalesCustomerListDto.FromEntity(c))
            .ToListAsync(cancellationToken);

        return Result<List<SalesCustomerListDto>>.Success(customers);
    }
}

public class CheckTaxNumberExistsQueryHandler : IRequestHandler<CheckTaxNumberExistsQuery, Result<bool>>
{
    private readonly SalesDbContext _context;

    public CheckTaxNumberExistsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CheckTaxNumberExistsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers
            .AsNoTracking()
            .Where(c => c.TaxNumber == request.TaxNumber);

        if (request.ExcludeCustomerId.HasValue)
        {
            query = query.Where(c => c.Id != request.ExcludeCustomerId.Value);
        }

        var exists = await query.AnyAsync(cancellationToken);

        return Result<bool>.Success(exists);
    }
}

public class CheckIdentityNumberExistsQueryHandler : IRequestHandler<CheckIdentityNumberExistsQuery, Result<bool>>
{
    private readonly SalesDbContext _context;

    public CheckIdentityNumberExistsQueryHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CheckIdentityNumberExistsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesCustomers
            .AsNoTracking()
            .Where(c => c.IdentityNumber == request.IdentityNumber);

        if (request.ExcludeCustomerId.HasValue)
        {
            query = query.Where(c => c.Id != request.ExcludeCustomerId.Value);
        }

        var exists = await query.AnyAsync(cancellationToken);

        return Result<bool>.Success(exists);
    }
}
