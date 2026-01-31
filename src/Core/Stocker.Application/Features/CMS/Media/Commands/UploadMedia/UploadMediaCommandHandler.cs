using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Commands.UploadMedia;

public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, Result<MediaUploadResultDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<UploadMediaCommandHandler> _logger;

    private static readonly string[] AllowedImageTypes = { "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml" };
    private static readonly string[] AllowedVideoTypes = { "video/mp4", "video/webm", "video/avi" };
    private static readonly string[] AllowedDocumentTypes = { "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

    public UploadMediaCommandHandler(
        IMasterDbContext context,
        IFileStorageService fileStorage,
        ILogger<UploadMediaCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<Result<MediaUploadResultDto>> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var file = request.File;

            // Validate file
            if (file == null || file.Length == 0)
            {
                return Result<MediaUploadResultDto>.Failure(
                    Error.Validation("Media.FileRequired", "Dosya zorunludur"));
            }

            // Validate file size (max 50MB)
            if (file.Length > 50 * 1024 * 1024)
            {
                return Result<MediaUploadResultDto>.Failure(
                    Error.Validation("Media.FileTooLarge", "Dosya boyutu 50MB'ı geçemez"));
            }

            // Validate content type
            var contentType = file.ContentType.ToLowerInvariant();
            if (!IsAllowedType(contentType))
            {
                return Result<MediaUploadResultDto>.Failure(
                    Error.Validation("Media.InvalidType", "Desteklenmeyen dosya türü"));
            }

            // Generate unique file name
            var extension = Path.GetExtension(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var folder = request.Folder ?? "cms";
            var filePath = $"{folder}/{storedFileName}";

            // Upload to storage
            string url;
            using (var stream = file.OpenReadStream())
            {
                url = await _fileStorage.UploadFileAsync(stream, filePath, contentType, cancellationToken);
            }

            // Get image dimensions if applicable
            int? width = null;
            int? height = null;
            // Note: In production, use a library like ImageSharp to get dimensions

            // Create media entity
            var media = CmsMedia.Create(
                fileName: file.FileName,
                storedFileName: storedFileName,
                filePath: filePath,
                url: url,
                mimeType: contentType,
                size: file.Length,
                uploadedById: request.UploadedById,
                width: width,
                height: height,
                altText: request.AltText,
                title: request.Title,
                folder: request.Folder);

            _context.CmsMedia.Add(media);
            await _context.SaveChangesAsync(cancellationToken);

            var result = new MediaUploadResultDto
            {
                Id = media.Id,
                Url = url,
                FileName = file.FileName,
                Type = media.Type,
                Size = media.Size,
                Width = width,
                Height = height
            };

            _logger.LogInformation("Media uploaded: {MediaId} - {FileName} ({Size} bytes)",
                media.Id, file.FileName, file.Length);

            return Result<MediaUploadResultDto>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading media: {FileName}", request.File?.FileName);
            return Result<MediaUploadResultDto>.Failure(
                Error.Failure("Media.UploadFailed", "Dosya yükleme işlemi başarısız oldu"));
        }
    }

    private static bool IsAllowedType(string contentType)
    {
        return AllowedImageTypes.Contains(contentType) ||
               AllowedVideoTypes.Contains(contentType) ||
               AllowedDocumentTypes.Contains(contentType);
    }
}
