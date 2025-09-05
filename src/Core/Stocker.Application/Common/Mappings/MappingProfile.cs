using AutoMapper;
using Stocker.Application.DTOs.Package;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.DTOs.Subscription;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Tenant Mappings
        CreateMap<Tenant, TenantDto>()
            .ForMember(dest => dest.Domain, opt => opt.MapFrom(src => src.Domains.FirstOrDefault(d => d.IsPrimary) != null ? src.Domains.FirstOrDefault(d => d.IsPrimary)!.DomainName : null))
            .ForMember(dest => dest.Subscription, opt => opt.MapFrom(src => src.Subscriptions.FirstOrDefault(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif) ?? src.Subscriptions.FirstOrDefault()));

        CreateMap<Tenant, TenantListDto>()
            .ForMember(dest => dest.Domain, opt => opt.MapFrom(src => 
                src.Domains.FirstOrDefault(d => d.IsPrimary) != null 
                    ? src.Domains.FirstOrDefault(d => d.IsPrimary)!.DomainName 
                    : string.Empty))
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => 
                src.Subscriptions.Any() 
                    ? (src.Subscriptions.FirstOrDefault(s => s.Status == SubscriptionStatus.Aktif) ?? src.Subscriptions.FirstOrDefault())!.Package.Name 
                    : string.Empty))
            .ForMember(dest => dest.SubscriptionEndDate, opt => opt.MapFrom(src => 
                src.Subscriptions.Any() 
                    ? (src.Subscriptions.FirstOrDefault(s => s.Status == SubscriptionStatus.Aktif) ?? src.Subscriptions.FirstOrDefault())!.CurrentPeriodEnd 
                    : (DateTime?)null))
            .ForMember(dest => dest.ContactEmail, opt => opt.MapFrom(src => src.ContactEmail.Value))
            .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UserCount, opt => opt.Ignore()); // Will be set separately in query handler

        // Subscription Mappings
        CreateMap<Subscription, TenantSubscriptionDto>()
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.Package.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.CurrentPeriodEnd))
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price.Amount));

        // Package Mappings
        CreateMap<Package, PackageDto>()
            .ForMember(dest => dest.BasePrice, opt => opt.MapFrom(src => new MoneyDto 
            { 
                Amount = src.BasePrice.Amount, 
                Currency = src.BasePrice.Currency 
            }))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.BasePrice.Currency))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
            .ForMember(dest => dest.BillingCycle, opt => opt.MapFrom(src => "Monthly")) // Default billing cycle
            .ForMember(dest => dest.MaxUsers, opt => opt.MapFrom(src => src.Limits.MaxUsers))
            .ForMember(dest => dest.MaxStorage, opt => opt.MapFrom(src => src.Limits.MaxStorage))
            .ForMember(dest => dest.TrialDays, opt => opt.MapFrom(src => src.TrialDays))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.IsPublic, opt => opt.MapFrom(src => src.IsPublic))
            .ForMember(dest => dest.DisplayOrder, opt => opt.MapFrom(src => src.DisplayOrder))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.Features.Select(f => new PackageFeatureDto
            {
                FeatureCode = f.FeatureCode,
                FeatureName = f.FeatureName,
                IsEnabled = true
            }).ToList()))
            .ForMember(dest => dest.Modules, opt => opt.MapFrom(src => src.Modules.Select(m => new PackageModuleDto
            {
                ModuleCode = m.ModuleCode,
                ModuleName = m.ModuleName,
                IsIncluded = m.IsIncluded
            }).ToList()));

        // Full Subscription Mappings
        CreateMap<Domain.Master.Entities.Subscription, SubscriptionDto>()
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Price.Currency))
            .ForMember(dest => dest.Modules, opt => opt.MapFrom(src => src.Modules))
            .ForMember(dest => dest.Usages, opt => opt.MapFrom(src => src.Usages));

        CreateMap<SubscriptionModule, SubscriptionModuleDto>()
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

        CreateMap<SubscriptionUsage, SubscriptionUsageDto>();

        // Tenant Invoice Mappings
        CreateMap<Domain.Tenant.Entities.Invoice, TenantInvoiceDto>()
            .ForMember(dest => dest.SubTotal, opt => opt.MapFrom(src => src.SubTotal.Amount))
            .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => src.TaxAmount.Amount))
            .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src => src.DiscountAmount.Amount))
            .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.TotalAmount.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.TotalAmount.Currency))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow)) // Invoice doesn't have CreatedAt yet
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => (DateTime?)null)) // Invoice doesn't have UpdatedAt yet
            .ForMember(dest => dest.CustomerName, opt => opt.Ignore()); // Will be set separately if needed

        CreateMap<Domain.Tenant.Entities.InvoiceItem, TenantInvoiceItemDto>()
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice.Amount))
            .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.TotalPrice.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.UnitPrice.Currency))
            .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src => src.DiscountAmount != null ? src.DiscountAmount.Amount : (decimal?)null))
            .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => src.TaxAmount != null ? src.TaxAmount.Amount : (decimal?)null));

        // TenantSettings Mappings
        CreateMap<TenantSettings, SettingDto>();
    }
}