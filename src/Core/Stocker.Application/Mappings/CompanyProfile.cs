using AutoMapper;
using Stocker.Application.DTOs.Company;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Mappings;

public class CompanyProfile : Profile
{
    public CompanyProfile()
    {
        CreateMap<Company, CompanyDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email.Value))
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone != null ? src.Phone.Value : string.Empty))
            .ForMember(dest => dest.Fax, opt => opt.MapFrom(src => src.Fax != null ? src.Fax.Value : null))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address));

        CreateMap<CompanyAddress, AddressDto>()
            .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.Country))
            .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
            .ForMember(dest => dest.District, opt => opt.MapFrom(src => src.District))
            .ForMember(dest => dest.PostalCode, opt => opt.MapFrom(src => src.PostalCode))
            .ForMember(dest => dest.AddressLine, opt => opt.MapFrom(src => src.AddressLine));
    }
}