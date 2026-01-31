using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Categories.Commands.CreateCategory;

public class CreateCategoryCommand : IRequest<Result<BlogCategoryDto>>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; } = 0;
}
