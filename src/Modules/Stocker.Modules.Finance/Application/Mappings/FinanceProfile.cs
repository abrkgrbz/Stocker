using AutoMapper;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.Mappings;

/// <summary>
/// AutoMapper profile for Finance module
/// </summary>
public class FinanceProfile : Profile
{
    public FinanceProfile()
    {
        // CurrentAccount mappings
        CreateMap<CurrentAccount, CurrentAccountDto>()
            .ForMember(dest => dest.DebitBalance, opt => opt.MapFrom(src => src.DebitBalance.Amount))
            .ForMember(dest => dest.CreditBalance, opt => opt.MapFrom(src => src.CreditBalance.Amount))
            .ForMember(dest => dest.Balance, opt => opt.MapFrom(src => src.Balance.Amount))
            .ForMember(dest => dest.CreditLimit, opt => opt.MapFrom(src => src.CreditLimit.Amount))
            .ForMember(dest => dest.UsedCredit, opt => opt.MapFrom(src => src.UsedCredit.Amount))
            .ForMember(dest => dest.AvailableCredit, opt => opt.MapFrom(src => src.AvailableCredit.Amount))
            .ForMember(dest => dest.RecentTransactions, opt => opt.Ignore());

        CreateMap<CurrentAccount, CurrentAccountSummaryDto>()
            .ForMember(dest => dest.Balance, opt => opt.MapFrom(src => src.Balance.Amount))
            .ForMember(dest => dest.CreditLimit, opt => opt.MapFrom(src => src.CreditLimit.Amount))
            .ForMember(dest => dest.AvailableCredit, opt => opt.MapFrom(src => src.AvailableCredit.Amount));

        CreateMap<CurrentAccountTransaction, CurrentAccountTransactionDto>()
            .ForMember(dest => dest.DebitAmount, opt => opt.MapFrom(src => src.DebitAmount.Amount))
            .ForMember(dest => dest.CreditAmount, opt => opt.MapFrom(src => src.CreditAmount.Amount))
            .ForMember(dest => dest.BalanceAfter, opt => opt.MapFrom(src => src.RunningBalance.Amount))
            .ForMember(dest => dest.DocumentNumber, opt => opt.MapFrom(src => src.TransactionNumber))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedDate))
            .ForMember(dest => dest.CurrentAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.TransactionTypeName, opt => opt.Ignore());

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.LineExtensionAmount, opt => opt.MapFrom(src => src.LineExtensionAmount.Amount))
            .ForMember(dest => dest.GrossAmount, opt => opt.MapFrom(src => src.GrossAmount.Amount))
            .ForMember(dest => dest.TotalDiscount, opt => opt.MapFrom(src => src.TotalDiscount.Amount))
            .ForMember(dest => dest.NetAmountBeforeTax, opt => opt.MapFrom(src => src.NetAmountBeforeTax.Amount))
            .ForMember(dest => dest.TotalVat, opt => opt.MapFrom(src => src.TotalVat.Amount))
            .ForMember(dest => dest.VatWithholdingAmount, opt => opt.MapFrom(src => src.VatWithholdingAmount.Amount))
            .ForMember(dest => dest.TotalOtherTaxes, opt => opt.MapFrom(src => src.TotalOtherTaxes.Amount))
            .ForMember(dest => dest.WithholdingTaxAmount, opt => opt.MapFrom(src => src.WithholdingTaxAmount.Amount))
            .ForMember(dest => dest.GrandTotal, opt => opt.MapFrom(src => src.GrandTotal.Amount))
            .ForMember(dest => dest.GrandTotalTRY, opt => opt.MapFrom(src => src.GrandTotalTRY.Amount))
            .ForMember(dest => dest.PaidAmount, opt => opt.MapFrom(src => src.PaidAmount.Amount))
            .ForMember(dest => dest.RemainingAmount, opt => opt.MapFrom(src => src.RemainingAmount.Amount));

        CreateMap<Invoice, InvoiceSummaryDto>()
            .ForMember(dest => dest.GrandTotal, opt => opt.MapFrom(src => src.GrandTotal.Amount))
            .ForMember(dest => dest.RemainingAmount, opt => opt.MapFrom(src => src.RemainingAmount.Amount));

        CreateMap<InvoiceLine, InvoiceLineDto>()
            .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.LineTotal.Amount))
            .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src => src.DiscountAmount.Amount))
            .ForMember(dest => dest.GrossAmount, opt => opt.MapFrom(src => src.GrossAmount.Amount))
            .ForMember(dest => dest.NetAmount, opt => opt.MapFrom(src => src.NetAmount.Amount))
            .ForMember(dest => dest.VatAmount, opt => opt.MapFrom(src => src.VatAmount.Amount))
            .ForMember(dest => dest.WithholdingAmount, opt => opt.MapFrom(src => src.WithholdingAmount.Amount))
            .ForMember(dest => dest.OtherTaxAmount, opt => opt.MapFrom(src => src.SctAmount.Amount))
            .ForMember(dest => dest.FinalAmount, opt => opt.MapFrom(src => src.AmountIncludingVat.Amount));

        CreateMap<InvoiceTax, InvoiceTaxDto>()
            .ForMember(dest => dest.TaxableAmount, opt => opt.MapFrom(src => src.TaxBase.Amount))
            .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => src.TaxAmount.Amount))
            .ForMember(dest => dest.TaxTypeName, opt => opt.Ignore());

        // Expense mappings
        CreateMap<Expense, ExpenseDto>()
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.NetAmount.Amount))
            .ForMember(dest => dest.AmountTRY, opt => opt.MapFrom(src => src.AmountTRY.Amount))
            .ForMember(dest => dest.VatAmount, opt => opt.MapFrom(src => src.VatAmount.Amount))
            .ForMember(dest => dest.GrossAmount, opt => opt.MapFrom(src => src.GrossAmount.Amount))
            .ForMember(dest => dest.WithholdingAmount, opt => opt.MapFrom(src => src.WithholdingAmount.Amount))
            .ForMember(dest => dest.CategoryName, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.CostCenterName, opt => opt.Ignore())
            .ForMember(dest => dest.ProjectName, opt => opt.Ignore())
            .ForMember(dest => dest.AccountCode, opt => opt.Ignore());

        CreateMap<Expense, ExpenseSummaryDto>()
            .ForMember(dest => dest.GrossAmount, opt => opt.MapFrom(src => src.GrossAmount.Amount))
            .ForMember(dest => dest.CategoryName, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentAccountName, opt => opt.Ignore());

        // Payment mappings
        CreateMap<Payment, PaymentDto>()
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount.Amount))
            .ForMember(dest => dest.AmountTRY, opt => opt.MapFrom(src => src.AmountTRY.Amount))
            .ForMember(dest => dest.PaymentTypeName, opt => opt.Ignore())
            .ForMember(dest => dest.DirectionName, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentAccountCode, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.BankAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.CashAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceNumber, opt => opt.Ignore())
            .ForMember(dest => dest.AllocatedAmount, opt => opt.Ignore())
            .ForMember(dest => dest.UnallocatedAmount, opt => opt.Ignore());

        CreateMap<Payment, PaymentSummaryDto>()
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount.Amount))
            .ForMember(dest => dest.CurrentAccountName, opt => opt.Ignore())
            .ForMember(dest => dest.AllocatedAmount, opt => opt.Ignore())
            .ForMember(dest => dest.UnallocatedAmount, opt => opt.Ignore());

        CreateMap<PaymentAllocation, PaymentAllocationDto>()
            .ForMember(dest => dest.AllocatedAmount, opt => opt.MapFrom(src => src.Amount.Amount))
            .ForMember(dest => dest.InvoiceNumber, opt => opt.Ignore());
    }
}
