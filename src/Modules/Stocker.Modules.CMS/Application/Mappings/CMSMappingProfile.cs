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

        // ==================== Landing Page Entities ====================

        // Testimonial mappings
        CreateMap<Testimonial, TestimonialDto>();
        CreateMap<CreateTestimonialDto, Testimonial>();
        CreateMap<UpdateTestimonialDto, Testimonial>();

        // PricingPlan mappings
        CreateMap<PricingPlan, PricingPlanDto>()
            .ForMember(d => d.Features, o => o.MapFrom(s => s.Features));
        CreateMap<CreatePricingPlanDto, PricingPlan>();
        CreateMap<UpdatePricingPlanDto, PricingPlan>();

        // PricingFeature mappings
        CreateMap<PricingFeature, PricingFeatureDto>();
        CreateMap<CreatePricingFeatureDto, PricingFeature>();
        CreateMap<UpdatePricingFeatureDto, PricingFeature>();

        // Feature mappings
        CreateMap<Feature, FeatureDto>();
        CreateMap<CreateFeatureDto, Feature>();
        CreateMap<UpdateFeatureDto, Feature>();

        // Industry mappings
        CreateMap<Industry, IndustryDto>();
        CreateMap<CreateIndustryDto, Industry>();
        CreateMap<UpdateIndustryDto, Industry>();

        // Integration mappings
        CreateMap<Integration, IntegrationDto>()
            .ForMember(d => d.Items, o => o.MapFrom(s => s.Items));
        CreateMap<CreateIntegrationDto, Integration>();
        CreateMap<UpdateIntegrationDto, Integration>();

        // IntegrationItem mappings
        CreateMap<IntegrationItem, IntegrationItemDto>();
        CreateMap<CreateIntegrationItemDto, IntegrationItem>();
        CreateMap<UpdateIntegrationItemDto, IntegrationItem>();

        // Stat mappings
        CreateMap<Stat, StatDto>();
        CreateMap<CreateStatDto, Stat>();
        CreateMap<UpdateStatDto, Stat>();

        // Partner mappings
        CreateMap<Partner, PartnerDto>();
        CreateMap<CreatePartnerDto, Partner>();
        CreateMap<UpdatePartnerDto, Partner>();

        // Achievement mappings
        CreateMap<Achievement, AchievementDto>();
        CreateMap<CreateAchievementDto, Achievement>();
        CreateMap<UpdateAchievementDto, Achievement>();

        // ==================== Company Page Entities ====================

        // TeamMember mappings
        CreateMap<TeamMember, TeamMemberDto>();
        CreateMap<CreateTeamMemberDto, TeamMember>();
        CreateMap<UpdateTeamMemberDto, TeamMember>();

        // CompanyValue mappings
        CreateMap<CompanyValue, CompanyValueDto>();
        CreateMap<CreateCompanyValueDto, CompanyValue>();
        CreateMap<UpdateCompanyValueDto, CompanyValue>();

        // ContactInfo mappings
        CreateMap<ContactInfo, ContactInfoDto>();
        CreateMap<CreateContactInfoDto, ContactInfo>();
        CreateMap<UpdateContactInfoDto, ContactInfo>();

        // SocialLink mappings
        CreateMap<SocialLink, SocialLinkDto>();
        CreateMap<CreateSocialLinkDto, SocialLink>();
        CreateMap<UpdateSocialLinkDto, SocialLink>();

        // ==================== Documentation Entities ====================

        // DocCategory mappings
        CreateMap<DocCategory, DocCategoryDto>()
            .ForMember(d => d.ArticleCount, o => o.MapFrom(s => s.Articles.Count))
            .ForMember(d => d.Articles, o => o.MapFrom(s => s.Articles));
        CreateMap<DocCategory, DocCategoryListDto>()
            .ForMember(d => d.ArticleCount, o => o.MapFrom(s => s.Articles.Count));
        CreateMap<CreateDocCategoryDto, DocCategory>();
        CreateMap<UpdateDocCategoryDto, DocCategory>();

        // DocArticle mappings
        CreateMap<DocArticle, DocArticleDto>()
            .ForMember(d => d.CategoryTitle, o => o.MapFrom(s => s.Category != null ? s.Category.Title : null));
        CreateMap<DocArticle, DocArticleListDto>()
            .ForMember(d => d.CategoryTitle, o => o.MapFrom(s => s.Category != null ? s.Category.Title : null));
        CreateMap<CreateDocArticleDto, DocArticle>();
        CreateMap<UpdateDocArticleDto, DocArticle>();
    }
}
