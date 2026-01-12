using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public class CreateLoyaltyProgramCommandHandler : IRequestHandler<CreateLoyaltyProgramCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateLoyaltyProgramCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateLoyaltyProgramCommand request, CancellationToken cancellationToken)
    {
        var program = new LoyaltyProgram(
            _unitOfWork.TenantId,
            request.Name,
            request.Code,
            request.ProgramType);

        if (request.Description != null)
            program.UpdateDetails(request.Name, request.Code, request.Description);

        if (request.StartDate.HasValue || request.EndDate.HasValue)
            program.SetDateRange(request.StartDate ?? DateTime.UtcNow, request.EndDate);

        program.SetPointsRules(
            request.PointsPerSpend,
            request.SpendUnit,
            request.MinimumSpendForPoints,
            request.MaxPointsPerTransaction);

        program.SetRedemptionRules(
            request.PointValue,
            request.MinimumRedemptionPoints,
            request.MaxRedemptionPercentage);

        program.SetExpiryRules(
            request.PointsValidityMonths,
            request.ResetPointsYearly);

        program.SetBonusRules(
            request.BirthdayBonusPoints,
            request.SignUpBonusPoints,
            request.ReferralBonusPoints,
            request.ReviewBonusPoints);

        if (request.Currency != "TRY")
            program.SetCurrency(request.Currency);

        if (!request.IsActive)
            program.Deactivate();

        await _unitOfWork.LoyaltyPrograms.CreateAsync(program, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(program.Id);
    }
}
