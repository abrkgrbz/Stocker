using AutoMapper;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Leads.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Application.Features.Leads.Handlers;

public class CreateLeadCommandHandler : IRequestHandler<CreateLeadCommand, LeadDto>
{
    private readonly ILeadRepository _leadRepository;
    private readonly IMapper _mapper;

    public CreateLeadCommandHandler(ILeadRepository leadRepository, IMapper mapper)
    {
        _leadRepository = leadRepository;
        _mapper = mapper;
    }

    public async Task<LeadDto> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = Lead.Create(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.Company,
            request.JobTitle,
            request.Source,
            request.Description
        );

        if (!string.IsNullOrWhiteSpace(request.Website))
            lead.SetWebsite(request.Website);

        if (!string.IsNullOrWhiteSpace(request.Industry))
            lead.SetIndustry(request.Industry);

        if (request.NumberOfEmployees.HasValue)
            lead.SetNumberOfEmployees(request.NumberOfEmployees.Value);

        if (request.AnnualRevenue.HasValue)
            lead.SetAnnualRevenue(request.AnnualRevenue.Value);

        lead.SetAddress(
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode
        );

        lead.SetRating(request.Rating);

        await _leadRepository.AddAsync(lead);
        await _leadRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<LeadDto>(lead);
    }
}