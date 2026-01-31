using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.UpdateDocItem;

public class UpdateDocItemCommandHandler : IRequestHandler<UpdateDocItemCommand, Result<DocItemDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdateDocItemCommandHandler> _logger;

    public UpdateDocItemCommandHandler(
        IMasterDbContext context,
        ILogger<UpdateDocItemCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<DocItemDto>> Handle(UpdateDocItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var docItem = await _context.DocItems
                .Include(d => d.Author)
                .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

            if (docItem == null)
            {
                return Result<DocItemDto>.Failure(
                    Error.NotFound("DocItem.NotFound", "Doküman bulunamadı"));
            }

            // Validate parent if changing
            if (request.ParentId != docItem.ParentId && request.ParentId.HasValue)
            {
                // Can't move under itself
                if (request.ParentId.Value == docItem.Id)
                {
                    return Result<DocItemDto>.Failure(
                        Error.Validation("DocItem.InvalidParent", "Öğe kendi altına taşınamaz"));
                }

                var parentExists = await _context.DocItems
                    .AnyAsync(d => d.Id == request.ParentId.Value && d.Type == DocItemType.Folder, cancellationToken);

                if (!parentExists)
                {
                    return Result<DocItemDto>.Failure(
                        Error.NotFound("DocItem.ParentNotFound", "Üst klasör bulunamadı"));
                }
            }

            // Update item
            docItem.Update(
                title: request.Title,
                slug: request.Slug,
                content: request.Content,
                order: request.Order,
                icon: request.Icon);

            // Move if parent changed
            if (request.ParentId != docItem.ParentId)
            {
                docItem.MoveTo(request.ParentId);
            }

            await _context.SaveChangesAsync(cancellationToken);

            var dto = new DocItemDto
            {
                Id = docItem.Id,
                Title = docItem.Title,
                Slug = docItem.Slug,
                Type = docItem.Type,
                ParentId = docItem.ParentId,
                Content = docItem.Content,
                Order = docItem.Order,
                Icon = docItem.Icon,
                IsActive = docItem.IsActive,
                CreatedAt = docItem.CreatedAt,
                UpdatedAt = docItem.UpdatedAt,
                AuthorId = docItem.AuthorId,
                AuthorName = docItem.Author != null ? $"{docItem.Author.FirstName} {docItem.Author.LastName}" : null
            };

            _logger.LogInformation("Doc item updated: {DocItemId} - {Title}", docItem.Id, docItem.Title);

            return Result<DocItemDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating doc item: {DocItemId}", request.Id);
            return Result<DocItemDto>.Failure(
                Error.Failure("DocItem.UpdateFailed", "Doküman güncelleme işlemi başarısız oldu"));
        }
    }
}
