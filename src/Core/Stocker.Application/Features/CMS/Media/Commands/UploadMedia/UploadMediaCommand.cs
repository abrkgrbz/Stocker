using MediatR;
using Microsoft.AspNetCore.Http;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Commands.UploadMedia;

public class UploadMediaCommand : IRequest<Result<MediaUploadResultDto>>
{
    public IFormFile File { get; set; } = null!;
    public string? AltText { get; set; }
    public string? Title { get; set; }
    public string? Folder { get; set; }
    public Guid UploadedById { get; set; }
}
