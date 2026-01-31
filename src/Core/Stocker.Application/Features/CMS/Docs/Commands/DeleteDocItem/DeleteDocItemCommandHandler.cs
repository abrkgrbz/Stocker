using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.DeleteDocItem;

public class DeleteDocItemCommandHandler : IRequestHandler<DeleteDocItemCommand, Result>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<DeleteDocItemCommandHandler> _logger;

    public DeleteDocItemCommandHandler(
        IMasterDbContext context,
        ILogger<DeleteDocItemCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteDocItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var docItem = await _context.DocItems
                .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

            if (docItem == null)
            {
                return Result.Failure(
                    Error.NotFound("DocItem.NotFound", "Doküman bulunamadı"));
            }

            // Note: Due to Cascade delete, children will be deleted automatically
            _context.DocItems.Remove(docItem);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Doc item deleted: {DocItemId} - {Title} ({Type})",
                docItem.Id, docItem.Title, docItem.Type);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting doc item: {DocItemId}", request.Id);
            return Result.Failure(
                Error.Failure("DocItem.DeleteFailed", "Doküman silme işlemi başarısız oldu"));
        }
    }
}
