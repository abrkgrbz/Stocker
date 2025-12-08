using AutoMapper;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.Mappings;

public class PurchaseProfile : Profile
{
    public PurchaseProfile()
    {
        // Supplier mappings
        CreateMap<Supplier, SupplierDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Contacts, opt => opt.MapFrom(src => src.Contacts))
            .ForMember(dest => dest.Products, opt => opt.MapFrom(src => src.Products));

        CreateMap<Supplier, SupplierListDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<SupplierContact, SupplierContactDto>();

        CreateMap<SupplierProduct, SupplierProductDto>();

        // PurchaseRequest mappings
        CreateMap<PurchaseRequest, PurchaseRequestDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<PurchaseRequest, PurchaseRequestListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<PurchaseRequestItem, PurchaseRequestItemDto>();

        // PurchaseOrder mappings
        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<PurchaseOrder, PurchaseOrderListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>();

        // GoodsReceipt mappings
        CreateMap<GoodsReceipt, GoodsReceiptDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<GoodsReceipt, GoodsReceiptListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<GoodsReceiptItem, GoodsReceiptItemDto>()
            .ForMember(dest => dest.Condition, opt => opt.MapFrom(src => src.Condition.ToString()));

        // PurchaseInvoice mappings
        CreateMap<PurchaseInvoice, PurchaseInvoiceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.EInvoiceStatus, opt => opt.MapFrom(src => src.EInvoiceStatus.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<PurchaseInvoice, PurchaseInvoiceListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.EInvoiceStatus, opt => opt.MapFrom(src => src.EInvoiceStatus.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<PurchaseInvoiceItem, PurchaseInvoiceItemDto>();

        // PurchaseReturn mappings
        CreateMap<PurchaseReturn, PurchaseReturnDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()))
            .ForMember(dest => dest.RefundMethod, opt => opt.MapFrom(src => src.RefundMethod.ToString()))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

        CreateMap<PurchaseReturn, PurchaseReturnListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()))
            .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items.Count));

        CreateMap<PurchaseReturnItem, PurchaseReturnItemDto>()
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason.ToString()));

        // SupplierPayment mappings
        CreateMap<SupplierPayment, SupplierPaymentDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Method.ToString()));

        CreateMap<SupplierPayment, SupplierPaymentListDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Method.ToString()));
    }
}
