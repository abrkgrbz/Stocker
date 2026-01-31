using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Categories.Queries.GetCategoriesList;

public class GetCategoriesListQuery : IRequest<Result<List<BlogCategoryListDto>>>
{
    public bool? ActiveOnly { get; set; } = true;
}
