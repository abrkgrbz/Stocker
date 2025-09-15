using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;

public sealed class GetSetupChecklistQueryHandler : IRequestHandler<GetSetupChecklistQuery, Result<TenantSetupChecklistDto>>
{
    private readonly IMasterDbContext _context;

    public GetSetupChecklistQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantSetupChecklistDto>> Handle(GetSetupChecklistQuery request, CancellationToken cancellationToken)
    {
        var checklist = await _context.TenantSetupChecklists
            .Where(x => x.TenantId == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (checklist == null)
        {
            // Create new checklist if not exists
            checklist = Domain.Master.Entities.TenantSetupChecklist.Create(request.TenantId, "System");
            _context.TenantSetupChecklists.Add(checklist);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var dto = new TenantSetupChecklistDto
        {
            Id = checklist.Id,
            TenantId = checklist.TenantId,
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
            CanGoLive = checklist.CanGoLive()
        };

        return Result<TenantSetupChecklistDto>.Success(dto);
    }
}