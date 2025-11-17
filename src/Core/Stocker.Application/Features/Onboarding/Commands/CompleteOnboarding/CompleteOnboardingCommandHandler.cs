using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Interfaces;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;

public sealed class CompleteOnboardingCommandHandler
    : IRequestHandler<CompleteOnboardingCommand, Result<CompleteOnboardingResponse>>
{
    private readonly IApplicationDbContext _context;

    public CompleteOnboardingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CompleteOnboardingResponse>> Handle(
        CompleteOnboardingCommand request,
        CancellationToken cancellationToken)
    {
        // Find or create wizard
        var wizard = await _context.SetupWizards
            .Include(w => w.Steps)
            .Where(w => w.WizardType == WizardType.InitialSetup)
            .OrderByDescending(w => w.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (wizard == null)
        {
            // Create new wizard with custom steps for minimal onboarding
            wizard = SetupWizard.Create(WizardType.InitialSetup, request.UserId.ToString());

            // Clear default steps and add our custom minimal steps
            wizard.Steps.Clear();

            // Step 1: Welcome (auto-complete)
            var welcomeStep = SetupWizardStep.Create(
                wizard.Id,
                0,
                "welcome",
                "Hoş Geldiniz",
                "Stocker'a hoş geldiniz",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(welcomeStep);

            // Step 2: Sector selection (optional)
            var sectorStep = SetupWizardStep.Create(
                wizard.Id,
                1,
                "sector",
                "Sektör Seçimi",
                "İş sektörünüzü seçin",
                StepCategory.Optional,
                false,
                true
            );
            wizard.Steps.Add(sectorStep);

            // Step 3: Company info (required)
            var companyStep = SetupWizardStep.Create(
                wizard.Id,
                2,
                "company_info",
                "Şirket Bilgileri",
                "Şirket bilgilerinizi girin",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(companyStep);

            // Step 4: Package selection (required)
            var packageStep = SetupWizardStep.Create(
                wizard.Id,
                3,
                "package",
                "Paket Seçimi",
                "Size uygun paketi seçin",
                StepCategory.Required,
                true,
                false
            );
            wizard.Steps.Add(packageStep);

            _context.SetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Start wizard if not started
        if (wizard.Status == WizardStatus.NotStarted)
        {
            wizard.StartWizard();
        }

        // Complete all steps with data
        var userName = request.UserId.ToString();

        // Step 1: Welcome - Auto complete
        var welcomeStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "welcome");
        if (welcomeStepToComplete != null && welcomeStepToComplete.Status != StepStatus.Completed)
        {
            if (welcomeStepToComplete.Status == StepStatus.Pending)
            {
                welcomeStepToComplete.MarkAsCurrent();
            }
            welcomeStepToComplete.Complete(userName);
        }

        // Step 2: Sector - Complete or skip
        var sectorStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "sector");
        if (sectorStepToComplete != null && sectorStepToComplete.Status != StepStatus.Completed && sectorStepToComplete.Status != StepStatus.Skipped)
        {
            if (sectorStepToComplete.Status == StepStatus.Pending)
            {
                sectorStepToComplete.MarkAsCurrent();
            }

            if (!string.IsNullOrWhiteSpace(request.Sector))
            {
                var sectorData = JsonSerializer.Serialize(new { sector = request.Sector });
                sectorStepToComplete.Complete(userName, sectorData);
            }
            else
            {
                sectorStepToComplete.Skip(userName, "User chose to skip sector selection");
            }
        }

        // Step 3: Company Info - Required
        var companyStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "company_info");
        if (companyStepToComplete != null && companyStepToComplete.Status != StepStatus.Completed)
        {
            if (companyStepToComplete.Status == StepStatus.Pending)
            {
                companyStepToComplete.MarkAsCurrent();
            }

            var companyData = JsonSerializer.Serialize(new
            {
                companyName = request.CompanyName,
                companyCode = request.CompanyCode,
                contactPhone = request.ContactPhone
            });
            companyStepToComplete.Complete(userName, companyData);
        }

        // Step 4: Package Selection - Required
        var packageStepToComplete = wizard.Steps.FirstOrDefault(s => s.Name == "package");
        if (packageStepToComplete != null && packageStepToComplete.Status != StepStatus.Completed)
        {
            if (packageStepToComplete.Status == StepStatus.Pending)
            {
                packageStepToComplete.MarkAsCurrent();
            }

            var packageData = JsonSerializer.Serialize(new { packageId = request.PackageId });
            wizard.CompleteCurrentStep(userName, packageData);
        }

        // Update wizard progress
        wizard.CompleteCurrentStep(userName, null);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<CompleteOnboardingResponse>.Success(new CompleteOnboardingResponse
        {
            WizardId = wizard.Id,
            IsCompleted = wizard.Status == WizardStatus.Completed,
            Message = "Onboarding completed successfully"
        });
    }
}
