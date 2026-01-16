using MediatR;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Commands.MarkAsRead;

public class MarkMessagesAsReadCommandHandler : IRequestHandler<MarkMessagesAsReadCommand, Result<int>>
{
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public MarkMessagesAsReadCommandHandler(
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<int>> Handle(MarkMessagesAsReadCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<int>.Failure(DomainErrors.Tenant.TenantNotFound);

        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<int>.Failure(DomainErrors.Authentication.NotAuthenticated);

        var messageIds = request.MessageIds.ToList();
        await _chatMessageRepository.MarkAsReadAsync(tenantId, userId.Value, messageIds, cancellationToken);

        return Result<int>.Success(messageIds.Count);
    }
}
