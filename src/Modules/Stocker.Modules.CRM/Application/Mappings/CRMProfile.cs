using AutoMapper;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Mappings;

public class CRMProfile : Profile
{
    public CRMProfile()
    {
        CreateMap<Lead, LeadDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
            .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.Ignore());

        CreateMap<Customer, CustomerDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.Ignore())
            .ForMember(dest => dest.Contacts, opt => opt.Ignore())
            .ForMember(dest => dest.Opportunities, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore());

        CreateMap<Contact, ContactDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
            .ForMember(dest => dest.CustomerName, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore());

        CreateMap<Opportunity, OpportunityDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.Ignore())
            .ForMember(dest => dest.PipelineName, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentStageName, opt => opt.Ignore())
            .ForMember(dest => dest.OwnerName, opt => opt.Ignore())
            .ForMember(dest => dest.Products, opt => opt.Ignore())
            .ForMember(dest => dest.RecentActivities, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.Ignore());

        CreateMap<Deal, DealDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.Ignore())
            .ForMember(dest => dest.PipelineName, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentStageName, opt => opt.Ignore())
            .ForMember(dest => dest.OwnerName, opt => opt.Ignore())
            .ForMember(dest => dest.Products, opt => opt.Ignore())
            .ForMember(dest => dest.Activities, opt => opt.Ignore())
            .ForMember(dest => dest.Notes, opt => opt.Ignore());

        CreateMap<Activity, ActivityDto>()
            .ForMember(dest => dest.LeadName, opt => opt.Ignore())
            .ForMember(dest => dest.CustomerName, opt => opt.Ignore())
            .ForMember(dest => dest.ContactName, opt => opt.Ignore())
            .ForMember(dest => dest.OpportunityName, opt => opt.Ignore())
            .ForMember(dest => dest.DealTitle, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedToName, opt => opt.Ignore());

        CreateMap<Campaign, CampaignDto>()
            .ForMember(dest => dest.OwnerName, opt => opt.Ignore())
            .ForMember(dest => dest.MemberCount, opt => opt.Ignore())
            .ForMember(dest => dest.TopMembers, opt => opt.Ignore());

        CreateMap<CampaignMember, CampaignMemberDto>()
            .ForMember(dest => dest.CampaignName, opt => opt.Ignore())
            .ForMember(dest => dest.LeadName, opt => opt.Ignore())
            .ForMember(dest => dest.ContactName, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.Phone, opt => opt.Ignore());

        CreateMap<Pipeline, PipelineDto>()
            .ForMember(dest => dest.Stages, opt => opt.MapFrom(src => src.Stages))
            .ForMember(dest => dest.OpportunityCount, opt => opt.Ignore())
            .ForMember(dest => dest.DealCount, opt => opt.Ignore())
            .ForMember(dest => dest.TotalValue, opt => opt.Ignore());

        CreateMap<PipelineStage, PipelineStageDto>()
            .ForMember(dest => dest.ItemCount, opt => opt.Ignore())
            .ForMember(dest => dest.TotalValue, opt => opt.Ignore());

        CreateMap<Note, NoteDto>()
            .ForMember(dest => dest.CreatedByName, opt => opt.Ignore());

        CreateMap<OpportunityProduct, OpportunityProductDto>()
            .ForMember(dest => dest.ProductName, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCode, opt => opt.Ignore());

        CreateMap<DealProduct, DealProductDto>()
            .ForMember(dest => dest.ProductName, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCode, opt => opt.Ignore());
    }
}