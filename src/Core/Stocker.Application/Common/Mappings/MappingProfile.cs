using AutoMapper;
using Stocker.Application.DTOs.Package;
using Stocker.Application.DTOs.Tenant;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Tenant Mappings
        CreateMap<Tenant, TenantDto>()
            .ForMember(dest => dest.Domain, opt => opt.MapFrom(src => src.Domains.FirstOrDefault(d => d.IsPrimary) != null ? src.Domains.FirstOrDefault(d => d.IsPrimary)!.DomainName : null))
            .ForMember(dest => dest.Subscription, opt => opt.MapFrom(src => src.Subscriptions.FirstOrDefault(s => s.Status == Domain.Master.Enums.SubscriptionStatus.Active) ?? src.Subscriptions.FirstOrDefault()));

        CreateMap<Tenant, TenantListDto>()
            .ForMember(dest => dest.Domain, opt => opt.MapFrom(src => 
                src.Domains.FirstOrDefault(d => d.IsPrimary) != null 
                    ? src.Domains.FirstOrDefault(d => d.IsPrimary)!.DomainName 
                    : string.Empty))
            .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => 
                src.Subscriptions.Any() 
                    ? (src.Subscriptions.FirstOrDefault(s => s.Status == SubscriptionStatus.Active) ?? src.Subscriptions.FirstOrDefault())!.Package.Name 
                    : string.Empty))
            .ForMember(dest => dest.SubscriptionEndDate, opt => opt.MapFrom(src => 
                src.Subscriptions.Any() 
                    ? (src.Subscriptions.FirstOrDefault(s => s.Status == SubscriptionStatus.Active) ?? src.Subscriptions.FirstOrDefault())!.CurrentPeriodEnd 
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
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.BasePrice.Amount))
            .ForMember(dest => dest.BillingCycle, opt => opt.Ignore()) // BillingCycle will be set from context
            .ForMember(dest => dest.MaxUsers, opt => opt.MapFrom(src => src.Limits.MaxUsers))
            .ForMember(dest => dest.MaxStorage, opt => opt.MapFrom(src => src.Limits.MaxStorage)) // MaxStorage is in GB in entity
            .ForMember(dest => dest.MaxProjects, opt => opt.MapFrom(src => src.Limits.MaxProjects))
            .ForMember(dest => dest.MaxApiCalls, opt => opt.MapFrom(src => src.Limits.MaxApiCalls))
            .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.Features.Select(f => f.FeatureName).ToList()))
            .ForMember(dest => dest.IsPopular, opt => opt.MapFrom(src => src.Type == PackageType.Professional)); // Example logic
    }
}