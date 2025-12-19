using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadByIdQuery : IRequest<LeadDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetLeadByIdQueryHandler : IRequestHandler<GetLeadByIdQuery, LeadDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetLeadByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<LeadDto?> Handle(GetLeadByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var lead = await _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.TenantId == tenantId, cancellationToken);

        if (lead == null)
            return null;

        return new LeadDto
        {
            Id = lead.Id,
            CompanyName = lead.CompanyName,
            FirstName = lead.FirstName,
            LastName = lead.LastName,
            FullName = lead.FullName,
            Email = lead.Email,
            Phone = lead.Phone,
            MobilePhone = lead.MobilePhone,
            JobTitle = lead.JobTitle,
            Industry = lead.Industry,
            Source = lead.Source,
            Status = lead.Status,
            Rating = lead.Rating,
            Address = lead.Address,
            City = lead.City,
            State = lead.State,
            Country = lead.Country,
            PostalCode = lead.PostalCode,
            Website = lead.Website,
            AnnualRevenue = lead.AnnualRevenue,
            NumberOfEmployees = lead.NumberOfEmployees,
            Description = lead.Description,
            AssignedToUserId = lead.AssignedToUserId,
            ConvertedDate = lead.ConvertedDate,
            ConvertedToCustomerId = lead.ConvertedToCustomerId,
            IsConverted = lead.IsConverted,
            Score = lead.Score,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt
        };
    }
}
