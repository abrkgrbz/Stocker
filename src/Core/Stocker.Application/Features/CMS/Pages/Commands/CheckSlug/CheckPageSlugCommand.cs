using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.CheckSlug;

public class CheckPageSlugCommand : IRequest<Result<SlugCheckResultDto>>
{
    public string Slug { get; set; } = string.Empty;
    public Guid? ExcludeId { get; set; }
}
