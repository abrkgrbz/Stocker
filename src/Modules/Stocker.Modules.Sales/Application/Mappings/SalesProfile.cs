using AutoMapper;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.Mappings;

public class SalesProfile : Profile
{
    public SalesProfile()
    {
        // SalesOrder mappings
        CreateMap<SalesOrder, SalesOrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<SalesOrder, SalesOrderListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<SalesOrderItem, SalesOrderItemDto>();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<Invoice, InvoiceListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<InvoiceItem, InvoiceItemDto>();

        // Payment mappings
        CreateMap<Payment, PaymentDto>()
            .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Method.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<Payment, PaymentListDto>()
            .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Method.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        // Quotation mappings
        CreateMap<Quotation, QuotationDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.QuotationNumber, opt => opt.MapFrom(src => src.QuotationNumber))
            .ForMember(dest => dest.QuotationDate, opt => opt.MapFrom(src => src.QuotationDate))
            .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<Quotation, QuotationListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.QuotationNumber, opt => opt.MapFrom(src => src.QuotationNumber))
            .ForMember(dest => dest.QuotationDate, opt => opt.MapFrom(src => src.QuotationDate))
            .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<QuotationItem, QuotationItemDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.QuotationId, opt => opt.MapFrom(src => src.QuotationId))
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.ProductName))
            .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
            .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.LineTotal));

        // Discount mappings
        CreateMap<Discount, DiscountDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ValueType, opt => opt.MapFrom(src => src.ValueType.ToString()))
            .ForMember(dest => dest.Applicability, opt => opt.MapFrom(src => src.Applicability.ToString()));

        CreateMap<Discount, DiscountListDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ValueType, opt => opt.MapFrom(src => src.ValueType.ToString()));

        // Promotion mappings
        CreateMap<Promotion, PromotionDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Rules, opt => opt.MapFrom(src => src.Rules));

        CreateMap<Promotion, PromotionListDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.RuleCount, opt => opt.MapFrom(src => src.Rules.Count));

        CreateMap<PromotionRule, PromotionRuleDto>()
            .ForMember(dest => dest.RuleType, opt => opt.MapFrom(src => src.RuleType.ToString()))
            .ForMember(dest => dest.DiscountType, opt => opt.MapFrom(src => src.DiscountType.ToString()));

        // Commission mappings
        CreateMap<CommissionPlan, CommissionPlanDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.CalculationType, opt => opt.MapFrom(src => src.CalculationType.ToString()))
            .ForMember(dest => dest.Tiers, opt => opt.MapFrom(src => src.Tiers));

        CreateMap<CommissionPlan, CommissionPlanListDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.CalculationType, opt => opt.MapFrom(src => src.CalculationType.ToString()))
            .ForMember(dest => dest.TierCount, opt => opt.MapFrom(src => src.Tiers.Count));

        CreateMap<CommissionTier, CommissionTierDto>()
            .ForMember(dest => dest.CalculationType, opt => opt.MapFrom(src => src.CalculationType.ToString()));

        CreateMap<SalesCommission, SalesCommissionDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<SalesCommission, SalesCommissionListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        // SalesReturn mappings
        CreateMap<SalesReturn, SalesReturnDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.RefundMethod, opt => opt.MapFrom(src => src.RefundMethod.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<SalesReturn, SalesReturnListDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<SalesReturnItem, SalesReturnItemDto>()
            .ForMember(dest => dest.Condition, opt => opt.MapFrom(src => src.Condition.ToString()));
    }
}
