using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public class UpdateLoyaltyProgramCommandHandler : IRequestHandler<UpdateLoyaltyProgramCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateLoyaltyProgramCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateLoyaltyProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _unitOfWork.LoyaltyPrograms.GetByIdAsync(request.Id, cancellationToken);

        if (program == null)
            return Result<bool>.Failure(Error.NotFound("LoyaltyProgram.NotFound", "Loyalty program not found"));

        if (program.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.Forbidden("LoyaltyProgram.Forbidden", "Access denied"));

        if (request.Name != null || request.Code != null || request.Description != null)
        {
            program.UpdateDetails(
                request.Name ?? program.Name,
                request.Code ?? program.Code,
                request.Description);
        }

        if (request.StartDate.HasValue || request.EndDate.HasValue)
            program.SetDateRange(request.StartDate ?? program.StartDate, request.EndDate);

        if (request.PointsPerSpend.HasValue || request.SpendUnit.HasValue || request.MinimumSpendForPoints.HasValue || request.MaxPointsPerTransaction.HasValue)
        {
            program.SetPointsRules(
                request.PointsPerSpend ?? program.PointsPerSpend,
                request.SpendUnit ?? program.SpendUnit,
                request.MinimumSpendForPoints,
                request.MaxPointsPerTransaction);
        }

        if (request.PointValue.HasValue || request.MinimumRedemptionPoints.HasValue || request.MaxRedemptionPercentage.HasValue)
        {
            program.SetRedemptionRules(
                request.PointValue ?? program.PointValue,
                request.MinimumRedemptionPoints ?? program.MinimumRedemptionPoints,
                request.MaxRedemptionPercentage);
        }

        if (request.PointsValidityMonths.HasValue || request.ResetPointsYearly.HasValue)
        {
            program.SetExpiryRules(
                request.PointsValidityMonths,
                request.ResetPointsYearly ?? program.ResetPointsYearly);
        }

        if (request.BirthdayBonusPoints.HasValue || request.SignUpBonusPoints.HasValue ||
            request.ReferralBonusPoints.HasValue || request.ReviewBonusPoints.HasValue)
        {
            program.SetBonusRules(
                request.BirthdayBonusPoints,
                request.SignUpBonusPoints,
                request.ReferralBonusPoints,
                request.ReviewBonusPoints);
        }

        if (request.ProgramType.HasValue)
            program.SetProgramType(request.ProgramType.Value);

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                program.Activate();
            else
                program.Deactivate();
        }

        await _unitOfWork.LoyaltyPrograms.UpdateAsync(program, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
