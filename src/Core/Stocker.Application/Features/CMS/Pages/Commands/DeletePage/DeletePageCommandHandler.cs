using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.DeletePage;

public class DeletePageCommandHandler : IRequestHandler<DeletePageCommand, Result>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<DeletePageCommandHandler> _logger;

    public DeletePageCommandHandler(
        IMasterDbContext context,
        ILogger<DeletePageCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(DeletePageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var page = await _context.CmsPages
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (page == null)
            {
                return Result.Failure(
                    Error.NotFound("CmsPage.NotFound", "Sayfa bulunamadı"));
            }

            _context.CmsPages.Remove(page);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("CMS Page deleted: {PageId} - {Title}", page.Id, page.Title);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting CMS page: {PageId}", request.Id);
            return Result.Failure(
                Error.Failure("CmsPage.DeleteFailed", "Sayfa silme işlemi başarısız oldu"));
        }
    }
}
