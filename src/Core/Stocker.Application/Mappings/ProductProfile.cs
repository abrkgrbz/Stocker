using AutoMapper;
using Stocker.Domain.Tenant.Entities;
using Stocker.Application.DTOs.Product;
using Stocker.Application.DTOs.Stock;

namespace Stocker.Application.Mappings;

public class ProductProfile : Profile
{
    public ProductProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.Unit.ToString()));

        CreateMap<Stock, StockDto>()
            .ForMember(dest => dest.ProductName, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCode, opt => opt.Ignore())
            .ForMember(dest => dest.WarehouseName, opt => opt.Ignore())
            .ForMember(dest => dest.WarehouseCode, opt => opt.Ignore())
            .ForMember(dest => dest.IsExpired, opt => opt.MapFrom(src => src.IsExpired()))
            .ForMember(dest => dest.IsLowStock, opt => opt.MapFrom(src => src.IsLowStock()))
            .ForMember(dest => dest.IsOverStock, opt => opt.MapFrom(src => src.IsOverStock()));

        CreateMap<StockMovement, StockMovementDto>()
            .ForMember(dest => dest.TypeName, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ProductName, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCode, opt => opt.Ignore())
            .ForMember(dest => dest.FromWarehouseName, opt => opt.Ignore())
            .ForMember(dest => dest.ToWarehouseName, opt => opt.Ignore());
    }
}