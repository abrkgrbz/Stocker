using AutoMapper;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Application.Mappings;

public class CMSMappingProfile : Profile
{
    public CMSMappingProfile()
    {
        // Page mappings
        CreateMap<CMSPage, PageDto>();
        CreateMap<CreatePageDto, CMSPage>();
        CreateMap<UpdatePageDto, CMSPage>();

        // Blog Category mappings
        CreateMap<BlogCategory, BlogCategoryDto>()
            .ForMember(d => d.PostCount, o => o.MapFrom(s => s.Posts.Count));
        CreateMap<BlogCategory, BlogCategoryListDto>()
            .ForMember(d => d.PostCount, o => o.MapFrom(s => s.Posts.Count));
        CreateMap<CreateBlogCategoryDto, BlogCategory>();
        CreateMap<UpdateBlogCategoryDto, BlogCategory>();

        // Blog Post mappings
        CreateMap<BlogPost, BlogPostDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : null));
        CreateMap<BlogPost, BlogPostListDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : null));
        CreateMap<CreateBlogPostDto, BlogPost>();
        CreateMap<UpdateBlogPostDto, BlogPost>();

        // FAQ Category mappings
        CreateMap<FAQCategory, FAQCategoryDto>()
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.Items.Count))
            .ForMember(d => d.Items, o => o.MapFrom(s => s.Items));
        CreateMap<FAQCategory, FAQCategoryListDto>()
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.Items.Count));
        CreateMap<CreateFAQCategoryDto, FAQCategory>();
        CreateMap<UpdateFAQCategoryDto, FAQCategory>();

        // FAQ Item mappings
        CreateMap<FAQItem, FAQItemDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : null));
        CreateMap<CreateFAQItemDto, FAQItem>();
        CreateMap<UpdateFAQItemDto, FAQItem>();

        // Setting mappings
        CreateMap<CMSSetting, CMSSettingDto>();
        CreateMap<CreateSettingDto, CMSSetting>();
    }
}
