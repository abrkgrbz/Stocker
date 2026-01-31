using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.CreateDocItem;

public class CreateDocItemCommandHandler : IRequestHandler<CreateDocItemCommand, Result<DocItemDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateDocItemCommandHandler> _logger;

    public CreateDocItemCommandHandler(
        IMasterDbContext context,
        ILogger<CreateDocItemCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<DocItemDto>> Handle(CreateDocItemCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Verify parent exists if specified
            if (request.ParentId.HasValue)
            {
                var parentExists = await _context.DocItems
                    .AnyAsync(d => d.Id == request.ParentId.Value && d.Type == DocItemType.Folder, cancellationToken);

                if (!parentExists)
                {
                    return Result<DocItemDto>.Failure(
                        Error.NotFound("DocItem.ParentNotFound", "Üst klasör bulunamadı"));
                }
            }

            // Create doc item
            DocItem docItem;

            if (request.Type == DocItemType.Folder)
            {
                docItem = DocItem.CreateFolder(
                    title: request.Title,
                    slug: request.Slug,
                    parentId: request.ParentId,
                    order: request.Order,
                    icon: request.Icon,
                    authorId: request.AuthorId);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return Result<DocItemDto>.Failure(
                        Error.Validation("DocItem.ContentRequired", "Dosya içeriği zorunludur"));
                }

                docItem = DocItem.CreateFile(
                    title: request.Title,
                    slug: request.Slug,
                    content: request.Content,
                    parentId: request.ParentId,
                    order: request.Order,
                    icon: request.Icon,
                    authorId: request.AuthorId);
            }

            _context.DocItems.Add(docItem);
            await _context.SaveChangesAsync(cancellationToken);

            // Get author name if exists
            string? authorName = null;
            if (request.AuthorId.HasValue)
            {
                var author = await _context.MasterUsers
                    .FirstOrDefaultAsync(u => u.Id == request.AuthorId.Value, cancellationToken);
                authorName = author != null ? $"{author.FirstName} {author.LastName}" : null;
            }

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
                AuthorName = authorName
            };

            _logger.LogInformation("Doc item created: {DocItemId} - {Title} ({Type})",
                docItem.Id, docItem.Title, docItem.Type);

            return Result<DocItemDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating doc item: {Title}", request.Title);
            return Result<DocItemDto>.Failure(
                Error.Failure("DocItem.CreateFailed", "Doküman oluşturma işlemi başarısız oldu"));
        }
    }
}
