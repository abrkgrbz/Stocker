using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Commands.DeleteMedia;

public class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand, Result>
{
    private readonly IMasterDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<DeleteMediaCommandHandler> _logger;

    public DeleteMediaCommandHandler(
        IMasterDbContext context,
        IFileStorageService fileStorage,
        ILogger<DeleteMediaCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var media = await _context.CmsMedia
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

            if (media == null)
            {
                return Result.Failure(
                    Error.NotFound("Media.NotFound", "Medya dosyası bulunamadı"));
            }

            // Delete from storage
            try
            {
                await _fileStorage.DeleteFileAsync(media.FilePath, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete file from storage: {FilePath}", media.FilePath);
                // Continue to delete from database even if storage deletion fails
            }

            // Delete from database
            _context.CmsMedia.Remove(media);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Media deleted: {MediaId} - {FileName}", media.Id, media.FileName);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting media: {MediaId}", request.Id);
            return Result.Failure(
                Error.Failure("Media.DeleteFailed", "Medya silme işlemi başarısız oldu"));
        }
    }
}
