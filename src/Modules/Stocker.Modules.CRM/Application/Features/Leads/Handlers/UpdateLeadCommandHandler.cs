using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Leads.Commands;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.Modules.CRM.Application.Features.Leads.Handlers;

public class UpdateLeadCommandHandler : IRequestHandler<UpdateLeadCommand, LeadDto>
{
    private readonly ILeadRepository _leadRepository;
    private readonly IMapper _mapper;

    public UpdateLeadCommandHandler(ILeadRepository leadRepository, IMapper mapper)
    {
        _leadRepository = leadRepository;
        _mapper = mapper;
    }

    public async Task<LeadDto> Handle(UpdateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdAsync(request.Id, cancellationToken);

        if (lead == null)
        {
            throw new NotFoundException($"Lead with ID {request.Id} not found");
        }

        // Update basic information
        var basicInfoResult = lead.UpdateBasicInfo(
            request.FirstName,
            request.LastName,
            request.Email,
            request.CompanyName,
            request.Phone,
            request.MobilePhone);

        if (basicInfoResult.IsFailure)
        {
            throw new ValidationException(basicInfoResult.Error.Description);
        }

        // Update business information
        var businessInfoResult = lead.UpdateBusinessInfo(
            request.JobTitle,
            request.Industry,
            request.Website,
            request.AnnualRevenue,
            request.NumberOfEmployees);

        if (businessInfoResult.IsFailure)
        {
            throw new ValidationException(businessInfoResult.Error.Description);
        }

        // Update address
        var addressResult = lead.UpdateAddress(
            request.Address,
            request.City,
            request.State,
            request.Country,
            request.PostalCode);

        if (addressResult.IsFailure)
        {
            throw new ValidationException(addressResult.Error.Description);
        }

        // Update status
        var statusResult = lead.UpdateStatus(request.Status);
        if (statusResult.IsFailure)
        {
            throw new ValidationException(statusResult.Error.Description);
        }

        // Update rating
        var ratingResult = lead.UpdateRating(request.Rating);
        if (ratingResult.IsFailure)
        {
            throw new ValidationException(ratingResult.Error.Description);
        }

        // Update description
        var descriptionResult = lead.UpdateDescription(request.Description);
        if (descriptionResult.IsFailure)
        {
            throw new ValidationException(descriptionResult.Error.Description);
        }

        // Note: Score is managed automatically by the entity based on status and rating changes
        // The UpdateStatus and UpdateRating methods already update the score

        await _leadRepository.UpdateAsync(lead, cancellationToken);

        // Use manual projection to match GetLeads pattern
        var updatedLead = await _leadRepository.GetQueryable()
            .Where(l => l.Id == lead.Id)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (updatedLead == null)
        {
            throw new NotFoundException($"Lead with ID {request.Id} not found after update");
        }

        return updatedLead;
    }
}
