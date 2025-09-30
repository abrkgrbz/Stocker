using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Tenant.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupChecklist.Create;

public sealed class CreateTenantSetupChecklistCommandHandler : IRequestHandler<CreateTenantSetupChecklistCommand, Result<TenantSetupChecklistDto>>
{
    private readonly ITenantDbContext _context;
    private readonly ILogger<CreateTenantSetupChecklistCommandHandler> _logger;

    public CreateTenantSetupChecklistCommandHandler(ITenantDbContext context, ILogger<CreateTenantSetupChecklistCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TenantSetupChecklistDto>> Handle(CreateTenantSetupChecklistCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Create setup checklist
            var checklist = Domain.Tenant.Entities.TenantSetupChecklist.Create("System");

            _context.TenantSetupChecklists.Add(checklist);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new TenantSetupChecklistDto
            {
                Id = checklist.Id,
                TenantId = _context.TenantId, // Get from context (database-per-tenant)
                Status = checklist.Status.ToString(),
                
                // Basic Setup
                CompanyInfoCompleted = checklist.CompanyInfoCompleted,
                LogoUploaded = checklist.LogoUploaded,
                AdminUserCreated = checklist.AdminUserCreated,
                
                // Organization Setup
                DepartmentsCreated = checklist.DepartmentsCreated,
                BranchesCreated = checklist.BranchesCreated,
                RolesConfigured = checklist.RolesConfigured,
                UsersInvited = checklist.UsersInvited,
                
                // Module Setup
                ModulesSelected = checklist.ModulesSelected,
                ModulesConfigured = checklist.ModulesConfigured,
                
                // Financial Setup
                ChartOfAccountsSetup = checklist.ChartOfAccountsSetup,
                TaxSettingsConfigured = checklist.TaxSettingsConfigured,
                CurrencyConfigured = checklist.CurrencyConfigured,
                
                // Security
                SecuritySettingsConfigured = checklist.SecuritySettingsConfigured,
                PasswordPolicySet = checklist.PasswordPolicySet,
                BackupConfigured = checklist.BackupConfigured,
                
                // Progress
                TotalItems = checklist.TotalItems,
                CompletedItems = checklist.CompletedItems,
                RequiredItems = checklist.RequiredItems,
                RequiredCompletedItems = checklist.RequiredCompletedItems,
                OverallProgress = checklist.OverallProgress,
                RequiredProgress = checklist.RequiredProgress,
                CanGoLive = checklist.RequiredProgress >= 100 // Check if all required items are completed
            };

            _logger.LogInformation("Setup checklist created for tenant {TenantId}", _context.TenantId);

            return Result<TenantSetupChecklistDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setup checklist for tenant {TenantId}", _context.TenantId);
            return Result<TenantSetupChecklistDto>.Failure(Error.Failure("Checklist.CreateFailed", $"Checklist oluşturulurken hata oluştu: {ex.Message}"));
        }
    }
}