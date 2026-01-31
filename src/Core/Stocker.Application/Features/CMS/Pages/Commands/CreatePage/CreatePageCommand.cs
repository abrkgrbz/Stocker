using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.CreatePage;

public class CreatePageCommand : IRequest<Result<CmsPageDto>>
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public PageStatus Status { get; set; } = PageStatus.Draft;
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? FeaturedImage { get; set; }
    public Guid AuthorId { get; set; }
}
