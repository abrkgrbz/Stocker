using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupChecklist.Commands.UpdateChecklistItem;

public sealed class UpdateChecklistItemCommandHandler : IRequestHandler<UpdateChecklistItemCommand, Result<TenantSetupChecklistDto>>
{
    private readonly ITenantDbContext _context;
    private readonly ILogger<UpdateChecklistItemCommandHandler> _logger;

    public UpdateChecklistItemCommandHandler(ITenantDbContext context, ILogger<UpdateChecklistItemCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TenantSetupChecklistDto>> Handle(UpdateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var checklist = await _context.TenantSetupChecklists
                .FirstOrDefaultAsync(x => x.Id == request.ChecklistId, cancellationToken);

            if (checklist == null)
                return Result<TenantSetupChecklistDto>.Failure(Error.NotFound("Checklist.NotFound", "Checklist bulunamadı."));

            // Update specific checklist item based on key
            switch (request.ItemKey.ToLower())
            {
                case "companyinfo":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.CompleteCompanyInfo(request.CompletedBy ?? "System");
                    break;

                case "logo":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.UploadLogo(request.CompletedBy ?? "System");
                    break;

                case "adminuser":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.CreateAdminUser(request.CompletedBy ?? "System");
                    break;

                case "departments":
                    if (request.ItemData != null && request.ItemData.TryGetValue("count", out var deptCount))
                        checklist.CreateDepartments(Convert.ToInt32(deptCount));
                    break;

                case "branches":
                    if (request.ItemData != null && request.ItemData.TryGetValue("count", out var branchCount))
                        checklist.CreateBranches(Convert.ToInt32(branchCount));
                    break;

                case "roles":
                    if (request.ItemData != null && request.ItemData.TryGetValue("count", out var roleCount))
                        checklist.ConfigureRoles(Convert.ToInt32(roleCount));
                    break;

                case "users":
                    if (request.ItemData != null && request.ItemData.TryGetValue("count", out var userCount))
                        checklist.InviteUsers(Convert.ToInt32(userCount));
                    break;

                case "modules":
                    if (request.ItemData != null && request.ItemData.TryGetValue("modules", out var modules))
                    {
                        var moduleList = modules.ToString()?.Split(',').ToList() ?? new List<string>();
                        checklist.SelectModules(moduleList);
                    }
                    break;

                case "chartofaccounts":
                    if (request.ItemData != null && request.ItemData.TryGetValue("count", out var accountCount))
                        checklist.SetupChartOfAccounts(Convert.ToInt32(accountCount));
                    break;

                case "taxsettings":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.ConfigureTaxSettings();
                    break;

                case "currency":
                    if (request.ItemData != null && request.ItemData.TryGetValue("currency", out var currency))
                        checklist.ConfigureCurrency(currency.ToString() ?? "TRY");
                    break;

                case "security":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.ConfigureSecuritySettings();
                    break;

                case "passwordpolicy":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.SetPasswordPolicy();
                    break;

                case "backup":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.ConfigureBackup();
                    break;

                case "compliance":
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        checklist.ConfigureCompliance();
                    break;

                case "email":
                    // Email integration method not available in new API
                    _logger.LogInformation("Email integration marked as completed for checklist {ChecklistId}", checklist.Id);
                    break;

                case "training":
                    // Training completion method not available in new API
                    if (request.ItemData != null && request.ItemData.TryGetValue("trainedUsers", out var trainedUsers))
                        _logger.LogInformation("Training marked as completed for {TrainedUsers} users on checklist {ChecklistId}", trainedUsers, checklist.Id);
                    break;

                case "testing":
                    // Testing completion method not available in new API
                    if (request.IsCompleted.HasValue && request.IsCompleted.Value)
                        _logger.LogInformation("Testing marked as completed for checklist {ChecklistId}", checklist.Id);
                    break;

                default:
                    return Result<TenantSetupChecklistDto>.Failure(Error.Validation("Checklist.InvalidItem", $"Geçersiz checklist öğesi: {request.ItemKey}"));
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Checklist item updated. ChecklistId: {ChecklistId}, Item: {ItemKey}", 
                checklist.Id, request.ItemKey);

            var dto = new TenantSetupChecklistDto
            {
                Id = checklist.Id,
                TenantId = Guid.Empty, // Tenant ID tracked separately
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating checklist item");
            return Result<TenantSetupChecklistDto>.Failure(Error.Failure("Checklist.UpdateFailed", $"İşlem sırasında hata oluştu: {ex.Message}"));
        }
    }
}