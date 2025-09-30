using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Tenant.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;

public sealed class GetSetupChecklistQueryHandler : IRequestHandler<GetSetupChecklistQuery, Result<TenantSetupChecklistDto>>
{
    private readonly ITenantDbContext _context;

    public GetSetupChecklistQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantSetupChecklistDto>> Handle(GetSetupChecklistQuery request, CancellationToken cancellationToken)
    {
        // TenantSetupChecklist no longer has TenantId - need to track tenant association separately
        var checklist = await _context.TenantSetupChecklists
            .FirstOrDefaultAsync(cancellationToken);

        if (checklist == null)
        {
            // Create new checklist if not exists
            checklist = Domain.Tenant.Entities.TenantSetupChecklist.Create("System");
            _context.TenantSetupChecklists.Add(checklist);
            await _context.SaveChangesAsync(cancellationToken);
        }

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

        return Result<TenantSetupChecklistDto>.Success(dto);
    }
}