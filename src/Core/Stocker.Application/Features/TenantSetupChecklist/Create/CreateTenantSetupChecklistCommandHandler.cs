using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupChecklist.Create;

public sealed class CreateTenantSetupChecklistCommandHandler : IRequestHandler<CreateTenantSetupChecklistCommand, Result<TenantSetupChecklistDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateTenantSetupChecklistCommandHandler> _logger;

    public CreateTenantSetupChecklistCommandHandler(IMasterDbContext context, ILogger<CreateTenantSetupChecklistCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TenantSetupChecklistDto>> Handle(CreateTenantSetupChecklistCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Create setup checklist
            var checklist = Domain.Master.Entities.TenantSetupChecklist.Create(request.TenantId, "System");

            _context.TenantSetupChecklists.Add(checklist);
            await _context.SaveChangesAsync(cancellationToken);

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

            _logger.LogInformation("Setup checklist created for tenant {TenantId}", request.TenantId);

            return Result<TenantSetupChecklistDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setup checklist for tenant {TenantId}", request.TenantId);
            return Result<TenantSetupChecklistDto>.Failure(Error.Failure("Checklist.CreateFailed", $"Checklist oluşturulurken hata oluştu: {ex.Message}"));
        }
    }
}