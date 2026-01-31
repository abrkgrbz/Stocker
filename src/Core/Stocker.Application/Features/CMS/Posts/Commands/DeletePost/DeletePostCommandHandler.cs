using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Commands.DeletePost;

public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, Result>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<DeletePostCommandHandler> _logger;

    public DeletePostCommandHandler(
        IMasterDbContext context,
        ILogger<DeletePostCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(DeletePostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var post = await _context.BlogPosts
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (post == null)
            {
                return Result.Failure(
                    Error.NotFound("BlogPost.NotFound", "Blog yazısı bulunamadı"));
            }

            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Blog post deleted: {PostId} - {Title}", post.Id, post.Title);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blog post: {PostId}", request.Id);
            return Result.Failure(
                Error.Failure("BlogPost.DeleteFailed", "Blog yazısı silme işlemi başarısız oldu"));
        }
    }
}
