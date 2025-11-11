using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Leads.Queries;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Application.Features.Leads.Handlers;

public class GetLeadsQueryHandler : IRequestHandler<GetLeadsQuery, IEnumerable<LeadDto>>
{
    private readonly ILeadRepository _leadRepository;
    private readonly IMapper _mapper;

    public GetLeadsQueryHandler(ILeadRepository leadRepository, IMapper mapper)
    {
        _leadRepository = leadRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LeadDto>> Handle(GetLeadsQuery request, CancellationToken cancellationToken)
    {
        var query = _leadRepository.GetQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(l => 
                l.FirstName.Contains(request.Search) ||
                l.LastName.Contains(request.Search) ||
                l.Email.Contains(request.Search) ||
                (l.CompanyName != null && l.CompanyName.Contains(request.Search)));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(l => l.Status == request.Status.Value);
        }

        if (request.Rating.HasValue)
        {
            query = query.Where(l => l.Rating == request.Rating.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Source))
        {
            query = query.Where(l => l.Source == request.Source);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(l => l.CreatedAt <= request.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Use manual LINQ projection instead of AutoMapper to avoid mapping issues
        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(l => new LeadDto
            {
                Id = l.Id,
                CompanyName = l.CompanyName,
                FirstName = l.FirstName,
                LastName = l.LastName,
                FullName = l.FirstName + " " + l.LastName,
                Email = l.Email,
                Phone = l.Phone,
                MobilePhone = l.MobilePhone,
                JobTitle = l.JobTitle,
                Industry = l.Industry,
                Source = l.Source,
                Status = l.Status,
                Rating = l.Rating,
                Address = l.Address,
                City = l.City,
                State = l.State,
                Country = l.Country,
                PostalCode = l.PostalCode,
                Website = l.Website,
                AnnualRevenue = l.AnnualRevenue,
                NumberOfEmployees = l.NumberOfEmployees,
                Description = l.Description,
                AssignedToUserId = l.AssignedToUserId,
                ConvertedDate = l.ConvertedDate,
                ConvertedToCustomerId = l.ConvertedToCustomerId,
                IsConverted = l.IsConverted,
                Score = l.Score,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return leads;
    }
}