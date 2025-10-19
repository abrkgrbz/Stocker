using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Contracts.CRM;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Services;

/// <summary>
/// Implementation of ICrmLeadService for cross-module lead operations
/// </summary>
public class CrmLeadService : ICrmLeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CrmLeadService> _logger;

    public CrmLeadService(
        ILeadRepository leadRepository,
        ICustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<CrmLeadService> logger)
    {
        _leadRepository = leadRepository;
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<LeadDto?> GetLeadByIdAsync(Guid leadId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);
            if (lead == null || lead.TenantId != tenantId)
                return null;

            return MapToDto(lead);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lead {LeadId} for tenant {TenantId}", leadId, tenantId);
            return null;
        }
    }

    public async Task<LeadDto?> GetLeadByEmailAsync(string email, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            // TODO: Add GetByEmailAsync to ILeadRepository
            _logger.LogWarning("GetLeadByEmailAsync not yet implemented in repository");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting lead by email {Email} for tenant {TenantId}", email, tenantId);
            return null;
        }
    }

    public async Task<Guid> CreateLeadFromCampaignAsync(CreateLeadDto leadData, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var leadResult = Lead.Create(
                tenantId,
                leadData.FirstName,
                leadData.LastName,
                leadData.Email,
                leadData.Company,  // CompanyName parameter
                leadData.Phone,
                leadData.LeadSource); // Source parameter

            if (!leadResult.IsSuccess)
            {
                _logger.LogWarning("Failed to create lead: {Error}", leadResult.Error);
                return Guid.Empty;
            }

            var lead = leadResult.Value;

            // Update additional fields
            if (!string.IsNullOrEmpty(leadData.JobTitle))
            {
                lead.UpdateBusinessInfo(leadData.JobTitle, null, null, null, null);
            }

            if (!string.IsNullOrEmpty(leadData.Notes))
            {
                lead.UpdateDescription(leadData.Notes);
            }

            await _leadRepository.AddAsync(lead, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Lead {LeadId} created from campaign for tenant {TenantId}", lead.Id, tenantId);
            return lead.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lead from campaign for tenant {TenantId}", tenantId);
            return Guid.Empty;
        }
    }

    public async Task<bool> UpdateLeadScoreAsync(Guid leadId, Guid tenantId, int newScore, CancellationToken cancellationToken = default)
    {
        try
        {
            var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);
            if (lead == null || lead.TenantId != tenantId)
            {
                _logger.LogWarning("Lead {LeadId} not found for tenant {TenantId}", leadId, tenantId);
                return false;
            }

            var updateResult = lead.UpdateScore(newScore);
            if (!updateResult.IsSuccess)
            {
                _logger.LogWarning("Failed to update lead score: {Error}", updateResult.Error);
                return false;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Lead {LeadId} score updated to {NewScore}", leadId, newScore);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lead score for lead {LeadId}", leadId);
            return false;
        }
    }

    public async Task<IEnumerable<LeadDto>> GetQualifiedLeadsAsync(Guid tenantId, int minScore, CancellationToken cancellationToken = default)
    {
        try
        {
            var leads = await _leadRepository.GetQualifiedLeadsAsync(cancellationToken);
            return leads
                .Where(l => l.TenantId == tenantId && l.Score >= minScore)
                .Select(MapToDto)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting qualified leads for tenant {TenantId}", tenantId);
            return Enumerable.Empty<LeadDto>();
        }
    }

    public async Task<Guid> ConvertLeadToCustomerAsync(Guid leadId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var lead = await _leadRepository.GetByIdAsync(leadId, cancellationToken);
            if (lead == null || lead.TenantId != tenantId)
            {
                _logger.LogWarning("Lead {LeadId} not found for tenant {TenantId}", leadId, tenantId);
                return Guid.Empty;
            }

            // Use Lead's built-in ConvertToCustomer method
            var convertResult = lead.ConvertToCustomer();
            if (!convertResult.IsSuccess)
            {
                _logger.LogWarning("Failed to convert lead to customer: {Error}", convertResult.Error);
                return Guid.Empty;
            }

            var customer = convertResult.Value;

            await _customerRepository.AddAsync(customer, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Lead {LeadId} converted to customer {CustomerId}", leadId, customer.Id);
            return customer.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting lead {LeadId} to customer", leadId);
            return Guid.Empty;
        }
    }

    private static LeadDto MapToDto(Lead lead)
    {
        return new LeadDto
        {
            Id = lead.Id,
            TenantId = lead.TenantId,
            FirstName = lead.FirstName,
            LastName = lead.LastName,
            Email = lead.Email,
            Phone = lead.Phone,
            Company = lead.CompanyName,
            JobTitle = lead.JobTitle,
            LeadSource = lead.Source ?? "Unknown",
            Status = lead.Status.ToString(),
            Score = lead.Score,
            IsQualified = lead.Status == LeadStatus.Qualified,
            CreatedAt = lead.CreatedAt
        };
    }
}
