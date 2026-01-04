using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Loans.Commands;

#region CreateLoanCommand

/// <summary>
/// Command to create a new loan
/// Yeni kredi oluşturma komutu
/// </summary>
public class CreateLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateLoanCommand
/// </summary>
public class CreateLoanCommandHandler : IRequestHandler<CreateLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(CreateLoanCommand request, CancellationToken cancellationToken)
    {
        // Generate loan number
        var loanNumber = await _unitOfWork.Loans.GetNextLoanNumberAsync(
            request.Data.LoanType,
            DateTime.UtcNow.Year,
            cancellationToken);

        // Create Money object for principal
        var principalAmount = Money.Create(request.Data.PrincipalAmount, request.Data.Currency);

        // Create loan entity
        var loan = Loan.Create(
            loanNumber,
            request.Data.LoanType,
            request.Data.SubType,
            request.Data.LenderName,
            principalAmount,
            request.Data.AnnualInterestRate,
            request.Data.InterestType,
            request.Data.StartDate,
            request.Data.TermMonths,
            request.Data.PaymentFrequency,
            request.Data.RepaymentMethod);

        // Set optional external reference
        if (!string.IsNullOrEmpty(request.Data.ExternalReference))
        {
            loan.SetExternalReference(request.Data.ExternalReference);
        }

        // Set lender
        if (request.Data.LenderId.HasValue)
        {
            loan.SetLender(request.Data.LenderId, request.Data.LenderName);
        }

        // Set bank account
        if (request.Data.BankAccountId.HasValue)
        {
            loan.SetBankAccount(request.Data.BankAccountId);
        }

        // Set fees
        if (request.Data.BsmvAmount.HasValue)
        {
            loan.SetBsmvAmount(Money.Create(request.Data.BsmvAmount.Value, request.Data.Currency));
        }

        if (request.Data.KkdfAmount.HasValue)
        {
            loan.SetKkdfAmount(Money.Create(request.Data.KkdfAmount.Value, request.Data.Currency));
        }

        if (request.Data.ProcessingFee.HasValue)
        {
            loan.SetProcessingFee(Money.Create(request.Data.ProcessingFee.Value, request.Data.Currency));
        }

        if (request.Data.OtherFees.HasValue)
        {
            loan.SetOtherFees(Money.Create(request.Data.OtherFees.Value, request.Data.Currency));
        }

        // Set variable rate details
        if (request.Data.InterestType == InterestType.Variable &&
            request.Data.ReferenceRateType.HasValue &&
            request.Data.Spread.HasValue)
        {
            loan.SetVariableRateDetails(request.Data.ReferenceRateType.Value, request.Data.Spread.Value);
        }

        // Set first payment date if provided
        if (request.Data.FirstPaymentDate.HasValue)
        {
            loan.SetFirstPaymentDate(request.Data.FirstPaymentDate.Value);
        }

        // Set collateral
        if (request.Data.CollateralType.HasValue)
        {
            var collateralValue = request.Data.CollateralValue.HasValue
                ? Money.Create(request.Data.CollateralValue.Value, request.Data.Currency)
                : null;
            loan.SetCollateral(request.Data.CollateralType.Value, request.Data.CollateralDescription, collateralValue);
        }

        // Set guarantor info
        if (!string.IsNullOrEmpty(request.Data.GuarantorInfo))
        {
            loan.SetGuarantorInfo(request.Data.GuarantorInfo);
        }

        // Set purpose
        if (!string.IsNullOrEmpty(request.Data.Purpose))
        {
            loan.SetPurpose(request.Data.Purpose);
        }

        // Set prepayment terms
        loan.SetPrepaymentTerms(request.Data.AllowsPrepayment, request.Data.PrepaymentPenaltyRate);

        // Set grace period
        if (request.Data.GracePeriodMonths.HasValue)
        {
            loan.SetGracePeriod(request.Data.GracePeriodMonths);
        }

        // Set accounting accounts
        if (request.Data.LoanPayableAccountId.HasValue || request.Data.InterestExpenseAccountId.HasValue)
        {
            loan.SetAccountingAccounts(request.Data.LoanPayableAccountId, request.Data.InterestExpenseAccountId);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            loan.SetNotes(request.Data.Notes);
        }

        // Generate payment schedule
        loan.GenerateSchedule();

        // Save loan
        await _unitOfWork.Loans.AddAsync(loan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(loan);
        return Result<LoanDto>.Success(dto);
    }

    internal static LoanDto MapToDto(Loan loan)
    {
        return new LoanDto
        {
            Id = loan.Id,
            LoanNumber = loan.LoanNumber,
            ExternalReference = loan.ExternalReference,
            LoanType = loan.LoanType,
            LoanTypeName = GetLoanTypeName(loan.LoanType),
            SubType = loan.SubType,
            SubTypeName = GetSubTypeName(loan.SubType),
            LenderId = loan.LenderId,
            LenderName = loan.LenderName,
            BankAccountId = loan.BankAccountId,
            PrincipalAmount = loan.PrincipalAmount.Amount,
            RemainingPrincipal = loan.RemainingPrincipal.Amount,
            TotalInterest = loan.TotalInterest.Amount,
            PaidInterest = loan.PaidInterest.Amount,
            Currency = loan.PrincipalAmount.Currency,
            BsmvAmount = loan.BsmvAmount.Amount,
            KkdfAmount = loan.KkdfAmount.Amount,
            ProcessingFee = loan.ProcessingFee.Amount,
            OtherFees = loan.OtherFees.Amount,
            AnnualInterestRate = loan.AnnualInterestRate,
            InterestType = loan.InterestType,
            InterestTypeName = GetInterestTypeName(loan.InterestType),
            ReferenceRateType = loan.ReferenceRateType,
            ReferenceRateTypeName = loan.ReferenceRateType.HasValue ? GetReferenceRateTypeName(loan.ReferenceRateType.Value) : null,
            Spread = loan.Spread,
            StartDate = loan.StartDate,
            EndDate = loan.EndDate,
            FirstPaymentDate = loan.FirstPaymentDate,
            ApprovalDate = loan.ApprovalDate,
            DisbursementDate = loan.DisbursementDate,
            ClosureDate = loan.ClosureDate,
            TermMonths = loan.TermMonths,
            PaymentFrequency = loan.PaymentFrequency,
            PaymentFrequencyName = GetPaymentFrequencyName(loan.PaymentFrequency),
            TotalInstallments = loan.TotalInstallments,
            PaidInstallments = loan.PaidInstallments,
            RepaymentMethod = loan.RepaymentMethod,
            RepaymentMethodName = GetRepaymentMethodName(loan.RepaymentMethod),
            CollateralType = loan.CollateralType,
            CollateralTypeName = loan.CollateralType.HasValue ? GetCollateralTypeName(loan.CollateralType.Value) : null,
            CollateralDescription = loan.CollateralDescription,
            CollateralValue = loan.CollateralValue?.Amount,
            GuarantorInfo = loan.GuarantorInfo,
            Purpose = loan.Purpose,
            Status = loan.Status,
            StatusName = GetStatusName(loan.Status),
            AllowsPrepayment = loan.AllowsPrepayment,
            PrepaymentPenaltyRate = loan.PrepaymentPenaltyRate,
            GracePeriodMonths = loan.GracePeriodMonths,
            LoanPayableAccountId = loan.LoanPayableAccountId,
            InterestExpenseAccountId = loan.InterestExpenseAccountId,
            Notes = loan.Notes,
            Schedule = loan.Schedule.Select(MapScheduleToDto).ToList(),
            Payments = loan.Payments.Select(MapPaymentToDto).ToList(),
            CreatedAt = loan.CreatedDate,
            UpdatedAt = loan.UpdatedDate
        };
    }

    internal static LoanScheduleDto MapScheduleToDto(LoanSchedule schedule)
    {
        return new LoanScheduleDto
        {
            Id = schedule.Id,
            LoanId = schedule.LoanId,
            InstallmentNumber = schedule.InstallmentNumber,
            DueDate = schedule.DueDate,
            PrincipalAmount = schedule.PrincipalAmount.Amount,
            InterestAmount = schedule.InterestAmount.Amount,
            TotalAmount = schedule.TotalAmount.Amount,
            RemainingBalance = schedule.RemainingBalance.Amount,
            Currency = schedule.PrincipalAmount.Currency,
            IsPaid = schedule.IsPaid,
            PaymentDate = schedule.PaymentDate,
            PaymentId = schedule.PaymentId
        };
    }

    internal static LoanPaymentDto MapPaymentToDto(LoanPayment payment)
    {
        return new LoanPaymentDto
        {
            Id = payment.Id,
            LoanId = payment.LoanId,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType,
            PaymentTypeName = GetLoanPaymentTypeName(payment.PaymentType),
            PrincipalPaid = payment.PrincipalPaid.Amount,
            InterestPaid = payment.InterestPaid.Amount,
            PenaltyPaid = payment.PenaltyPaid.Amount,
            TotalPaid = payment.TotalPaid.Amount,
            Currency = payment.PrincipalPaid.Currency,
            Reference = payment.Reference,
            BankTransactionId = payment.BankTransactionId,
            Notes = payment.Notes
        };
    }

    #region Name Helpers

    private static string GetLoanTypeName(LoanType type) => type switch
    {
        LoanType.BusinessLoan => "İşletme Kredisi",
        LoanType.InvestmentLoan => "Yatırım Kredisi",
        LoanType.SpotCredit => "Spot Kredi",
        LoanType.RevolvingCredit => "Rotatif Kredi",
        LoanType.Leasing => "Leasing",
        LoanType.Factoring => "Factoring",
        LoanType.Forfaiting => "Forfaiting",
        LoanType.LetterOfCredit => "Akreditif",
        LoanType.LetterOfGuarantee => "Teminat Mektubu",
        LoanType.EximbankCredit => "Eximbank Kredisi",
        LoanType.KosgebCredit => "KOSGEB Kredisi",
        LoanType.VehicleLoan => "Taşıt Kredisi",
        LoanType.RealEstateLoan => "Gayrimenkul Kredisi",
        LoanType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetSubTypeName(LoanSubType type) => type switch
    {
        LoanSubType.TryLoan => "TL Kredi",
        LoanSubType.ForeignCurrencyLoan => "Döviz Kredisi",
        LoanSubType.FxIndexed => "Dövize Endeksli",
        LoanSubType.Installment => "Taksitli",
        LoanSubType.NonInstallment => "Taksitsiz",
        LoanSubType.ShortTerm => "Kısa Vadeli",
        LoanSubType.LongTerm => "Uzun Vadeli",
        _ => type.ToString()
    };

    private static string GetInterestTypeName(InterestType type) => type switch
    {
        InterestType.Fixed => "Sabit",
        InterestType.Variable => "Değişken",
        InterestType.Mixed => "Karma",
        _ => type.ToString()
    };

    private static string GetReferenceRateTypeName(ReferenceRateType type) => type switch
    {
        ReferenceRateType.CbrtPolicyRate => "TCMB Politika Faizi",
        ReferenceRateType.TrLibor => "TRLibor",
        ReferenceRateType.TlRef => "TLREF",
        ReferenceRateType.Euribor => "Euribor",
        ReferenceRateType.Libor => "Libor",
        ReferenceRateType.Sofr => "SOFR",
        ReferenceRateType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetPaymentFrequencyName(PaymentFrequency freq) => freq switch
    {
        PaymentFrequency.Weekly => "Haftalık",
        PaymentFrequency.BiWeekly => "İki Haftalık",
        PaymentFrequency.Monthly => "Aylık",
        PaymentFrequency.Quarterly => "Üç Aylık",
        PaymentFrequency.SemiAnnually => "Altı Aylık",
        PaymentFrequency.Annually => "Yıllık",
        PaymentFrequency.AtMaturity => "Vade Sonunda",
        _ => freq.ToString()
    };

    private static string GetRepaymentMethodName(RepaymentMethod method) => method switch
    {
        RepaymentMethod.EqualInstallments => "Eşit Taksit",
        RepaymentMethod.EqualPrincipal => "Eşit Anapara",
        RepaymentMethod.BulletPayment => "Vade Sonunda Tek Ödeme",
        RepaymentMethod.InterestOnly => "Sadece Faiz",
        RepaymentMethod.BalloonPayment => "Balon Ödeme",
        RepaymentMethod.Custom => "Özel Plan",
        _ => method.ToString()
    };

    private static string GetCollateralTypeName(CollateralType type) => type switch
    {
        CollateralType.Unsecured => "Teminatsız",
        CollateralType.RealEstateMortgage => "Gayrimenkul İpoteği",
        CollateralType.VehiclePledge => "Taşıt Rehni",
        CollateralType.EquipmentPledge => "Makine-Teçhizat Rehni",
        CollateralType.SecuritiesPledge => "Menkul Kıymet Rehni",
        CollateralType.CommodityPledge => "Emtia Rehni",
        CollateralType.AssignmentOfReceivables => "Alacak Temliki",
        CollateralType.PersonalGuarantee => "Kefalet",
        CollateralType.BankGuarantee => "Banka Teminat Mektubu",
        CollateralType.CheckPromissoryNote => "Çek/Senet",
        CollateralType.Other => "Diğer",
        _ => type.ToString()
    };

    private static string GetStatusName(LoanStatus status) => status switch
    {
        LoanStatus.Draft => "Taslak",
        LoanStatus.PendingApproval => "Onay Bekliyor",
        LoanStatus.Approved => "Onaylandı",
        LoanStatus.Active => "Aktif",
        LoanStatus.Closed => "Kapalı",
        LoanStatus.Defaulted => "Temerrüt",
        LoanStatus.Restructured => "Yeniden Yapılandırıldı",
        LoanStatus.Cancelled => "İptal Edildi",
        _ => status.ToString()
    };

    private static string GetLoanPaymentTypeName(LoanPaymentType type) => type switch
    {
        LoanPaymentType.Regular => "Normal Ödeme",
        LoanPaymentType.Prepayment => "Erken Ödeme",
        LoanPaymentType.LatePayment => "Gecikmiş Ödeme",
        LoanPaymentType.PartialPayment => "Kısmi Ödeme",
        LoanPaymentType.Payoff => "Kapanış Ödemesi",
        _ => type.ToString()
    };

    #endregion
}

#endregion

#region UpdateLoanCommand

/// <summary>
/// Command to update a loan
/// Kredi güncelleme komutu
/// </summary>
public class UpdateLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateLoanCommand
/// </summary>
public class UpdateLoanCommandHandler : IRequestHandler<UpdateLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(UpdateLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        if (loan.Status == LoanStatus.Closed || loan.Status == LoanStatus.Cancelled)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Status", "Kapalı veya iptal edilmiş krediler güncellenemez"));
        }

        // Update external reference
        if (request.Data.ExternalReference != null)
        {
            loan.SetExternalReference(request.Data.ExternalReference);
        }

        // Update lender
        if (request.Data.LenderId.HasValue || request.Data.LenderName != null)
        {
            loan.SetLender(request.Data.LenderId, request.Data.LenderName ?? loan.LenderName);
        }

        // Update bank account
        if (request.Data.BankAccountId.HasValue)
        {
            loan.SetBankAccount(request.Data.BankAccountId);
        }

        // Update fees
        if (request.Data.BsmvAmount.HasValue)
        {
            loan.SetBsmvAmount(Money.Create(request.Data.BsmvAmount.Value, loan.PrincipalAmount.Currency));
        }

        if (request.Data.KkdfAmount.HasValue)
        {
            loan.SetKkdfAmount(Money.Create(request.Data.KkdfAmount.Value, loan.PrincipalAmount.Currency));
        }

        if (request.Data.ProcessingFee.HasValue)
        {
            loan.SetProcessingFee(Money.Create(request.Data.ProcessingFee.Value, loan.PrincipalAmount.Currency));
        }

        if (request.Data.OtherFees.HasValue)
        {
            loan.SetOtherFees(Money.Create(request.Data.OtherFees.Value, loan.PrincipalAmount.Currency));
        }

        // Update variable rate details
        if (request.Data.ReferenceRateType.HasValue && request.Data.Spread.HasValue)
        {
            try
            {
                loan.SetVariableRateDetails(request.Data.ReferenceRateType.Value, request.Data.Spread.Value);
            }
            catch (InvalidOperationException ex)
            {
                return Result<LoanDto>.Failure(
                    Error.Validation("Loan.InterestType", ex.Message));
            }
        }

        // Update collateral
        if (request.Data.CollateralType.HasValue)
        {
            var collateralValue = request.Data.CollateralValue.HasValue
                ? Money.Create(request.Data.CollateralValue.Value, loan.PrincipalAmount.Currency)
                : null;
            loan.SetCollateral(request.Data.CollateralType.Value, request.Data.CollateralDescription, collateralValue);
        }

        // Update guarantor info
        if (request.Data.GuarantorInfo != null)
        {
            loan.SetGuarantorInfo(request.Data.GuarantorInfo);
        }

        // Update purpose
        if (request.Data.Purpose != null)
        {
            loan.SetPurpose(request.Data.Purpose);
        }

        // Update prepayment terms
        if (request.Data.AllowsPrepayment.HasValue)
        {
            loan.SetPrepaymentTerms(request.Data.AllowsPrepayment.Value, request.Data.PrepaymentPenaltyRate);
        }

        // Update grace period
        if (request.Data.GracePeriodMonths.HasValue)
        {
            loan.SetGracePeriod(request.Data.GracePeriodMonths);
        }

        // Update accounting accounts
        if (request.Data.LoanPayableAccountId.HasValue || request.Data.InterestExpenseAccountId.HasValue)
        {
            loan.SetAccountingAccounts(
                request.Data.LoanPayableAccountId ?? loan.LoanPayableAccountId,
                request.Data.InterestExpenseAccountId ?? loan.InterestExpenseAccountId);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            loan.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateLoanCommandHandler.MapToDto(loan);
        return Result<LoanDto>.Success(dto);
    }
}

#endregion

#region DeleteLoanCommand

/// <summary>
/// Command to delete a loan
/// Kredi silme komutu
/// </summary>
public class DeleteLoanCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteLoanCommand
/// </summary>
public class DeleteLoanCommandHandler : IRequestHandler<DeleteLoanCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithPaymentsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        if (loan.Status == LoanStatus.Active)
        {
            return Result<bool>.Failure(
                Error.Validation("Loan.Status", "Aktif krediler silinemez. Önce kapatılmalıdır"));
        }

        if (loan.Payments.Any())
        {
            return Result<bool>.Failure(
                Error.Validation("Loan.Payments", "Ödemesi olan krediler silinemez"));
        }

        _unitOfWork.Loans.Remove(loan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

#endregion

#region MakeLoanPaymentCommand

/// <summary>
/// Command to make a loan payment
/// Kredi ödemesi kaydetme komutu
/// </summary>
public class MakeLoanPaymentCommand : IRequest<Result<LoanPaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int LoanId { get; set; }
    public MakeLoanPaymentDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for MakeLoanPaymentCommand
/// </summary>
public class MakeLoanPaymentCommandHandler : IRequestHandler<MakeLoanPaymentCommand, Result<LoanPaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MakeLoanPaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanPaymentDto>> Handle(MakeLoanPaymentCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.LoanId, cancellationToken);
        if (loan == null)
        {
            return Result<LoanPaymentDto>.Failure(
                Error.NotFound("Loan", $"ID {request.LoanId} ile kredi bulunamadı"));
        }

        try
        {
            var principalPaid = Money.Create(request.Data.PrincipalAmount, loan.PrincipalAmount.Currency);
            var interestPaid = Money.Create(request.Data.InterestAmount, loan.PrincipalAmount.Currency);

            var payment = loan.RecordPayment(
                request.Data.PaymentDate,
                principalPaid,
                interestPaid,
                request.Data.Reference);

            if (request.Data.BankTransactionId.HasValue)
            {
                payment.SetBankTransaction(request.Data.BankTransactionId.Value);
            }

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                payment.SetNotes(request.Data.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapPaymentToDto(payment);
            return Result<LoanPaymentDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanPaymentDto>.Failure(
                Error.Validation("Loan.Payment", ex.Message));
        }
    }
}

#endregion

#region MakePrepaymentCommand

/// <summary>
/// Command to make a prepayment
/// Erken ödeme komutu
/// </summary>
public class MakePrepaymentCommand : IRequest<Result<LoanPaymentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int LoanId { get; set; }
    public MakePrepaymentDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for MakePrepaymentCommand
/// </summary>
public class MakePrepaymentCommandHandler : IRequestHandler<MakePrepaymentCommand, Result<LoanPaymentDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MakePrepaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanPaymentDto>> Handle(MakePrepaymentCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.LoanId, cancellationToken);
        if (loan == null)
        {
            return Result<LoanPaymentDto>.Failure(
                Error.NotFound("Loan", $"ID {request.LoanId} ile kredi bulunamadı"));
        }

        try
        {
            var amount = Money.Create(request.Data.Amount, loan.PrincipalAmount.Currency);

            var payment = loan.MakePrepayment(
                request.Data.PaymentDate,
                amount,
                request.Data.CloseIfPaidOff);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                payment.SetNotes(request.Data.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapPaymentToDto(payment);
            return Result<LoanPaymentDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanPaymentDto>.Failure(
                Error.Validation("Loan.Prepayment", ex.Message));
        }
    }
}

#endregion

#region ApproveLoanCommand

/// <summary>
/// Command to approve a loan
/// Kredi onaylama komutu
/// </summary>
public class ApproveLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public ApproveLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for ApproveLoanCommand
/// </summary>
public class ApproveLoanCommandHandler : IRequestHandler<ApproveLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(ApproveLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        try
        {
            loan.Approve(request.Data.ApprovalDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                loan.SetNotes((loan.Notes ?? "") + "\n[Onay Notu] " + request.Data.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapToDto(loan);
            return Result<LoanDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Approve", ex.Message));
        }
    }
}

#endregion

#region DisburseLoanCommand

/// <summary>
/// Command to disburse a loan
/// Kredi kullandırma komutu
/// </summary>
public class DisburseLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DisburseLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for DisburseLoanCommand
/// </summary>
public class DisburseLoanCommandHandler : IRequestHandler<DisburseLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DisburseLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(DisburseLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        try
        {
            loan.Disburse(request.Data.DisbursementDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                loan.SetNotes((loan.Notes ?? "") + "\n[Kullandırım Notu] " + request.Data.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapToDto(loan);
            return Result<LoanDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Disburse", ex.Message));
        }
    }
}

#endregion

#region CloseLoanCommand

/// <summary>
/// Command to close a loan
/// Kredi kapatma komutu
/// </summary>
public class CloseLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CloseLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CloseLoanCommand
/// </summary>
public class CloseLoanCommandHandler : IRequestHandler<CloseLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CloseLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(CloseLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        try
        {
            loan.Close(request.Data.ClosureDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                loan.SetNotes((loan.Notes ?? "") + "\n[Kapatma Notu] " + request.Data.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapToDto(loan);
            return Result<LoanDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Close", ex.Message));
        }
    }
}

#endregion

#region RestructureLoanCommand

/// <summary>
/// Command to restructure a loan
/// Kredi yeniden yapılandırma komutu
/// </summary>
public class RestructureLoanCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public RestructureLoanDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for RestructureLoanCommand
/// </summary>
public class RestructureLoanCommandHandler : IRequestHandler<RestructureLoanCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RestructureLoanCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(RestructureLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        if (loan.Status != LoanStatus.Active && loan.Status != LoanStatus.Defaulted)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Status", "Sadece aktif veya temerrütteki krediler yeniden yapılandırılabilir"));
        }

        loan.Restructure(
            request.Data.NewInterestRate,
            request.Data.NewTermMonths,
            request.Data.NewStartDate);

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            loan.SetNotes((loan.Notes ?? "") + "\n[Yapılandırma Notu] " + request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateLoanCommandHandler.MapToDto(loan);
        return Result<LoanDto>.Success(dto);
    }
}

#endregion

#region MarkLoanAsDefaultedCommand

/// <summary>
/// Command to mark a loan as defaulted
/// Krediyi temerrüde düşürme komutu
/// </summary>
public class MarkLoanAsDefaultedCommand : IRequest<Result<LoanDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Handler for MarkLoanAsDefaultedCommand
/// </summary>
public class MarkLoanAsDefaultedCommandHandler : IRequestHandler<MarkLoanAsDefaultedCommand, Result<LoanDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkLoanAsDefaultedCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoanDto>> Handle(MarkLoanAsDefaultedCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithDetailsAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<LoanDto>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        try
        {
            loan.MarkAsDefaulted();

            if (!string.IsNullOrEmpty(request.Notes))
            {
                loan.SetNotes((loan.Notes ?? "") + "\n[Temerrüt Notu] " + request.Notes);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = CreateLoanCommandHandler.MapToDto(loan);
            return Result<LoanDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<LoanDto>.Failure(
                Error.Validation("Loan.Default", ex.Message));
        }
    }
}

#endregion

#region GenerateLoanScheduleCommand

/// <summary>
/// Command to regenerate loan payment schedule
/// Kredi ödeme planını yeniden oluşturma komutu
/// </summary>
public class GenerateLoanScheduleCommand : IRequest<Result<List<LoanScheduleDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GenerateLoanScheduleCommand
/// </summary>
public class GenerateLoanScheduleCommandHandler : IRequestHandler<GenerateLoanScheduleCommand, Result<List<LoanScheduleDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GenerateLoanScheduleCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LoanScheduleDto>>> Handle(GenerateLoanScheduleCommand request, CancellationToken cancellationToken)
    {
        var loan = await _unitOfWork.Loans.GetWithScheduleAsync(request.Id, cancellationToken);
        if (loan == null)
        {
            return Result<List<LoanScheduleDto>>.Failure(
                Error.NotFound("Loan", $"ID {request.Id} ile kredi bulunamadı"));
        }

        if (loan.Status != LoanStatus.Draft && loan.Status != LoanStatus.PendingApproval)
        {
            return Result<List<LoanScheduleDto>>.Failure(
                Error.Validation("Loan.Status", "Sadece taslak veya onay bekleyen kredilerin ödeme planı yeniden oluşturulabilir"));
        }

        loan.GenerateSchedule();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dtos = loan.Schedule.Select(CreateLoanCommandHandler.MapScheduleToDto).ToList();
        return Result<List<LoanScheduleDto>>.Success(dtos);
    }
}

#endregion
