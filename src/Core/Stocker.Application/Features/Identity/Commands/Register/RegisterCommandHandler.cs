using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    // For now, we'll create a simplified version without full implementation
    // This will be properly implemented when all dependencies are set up
    
    public RegisterCommandHandler()
    {
        // Simplified constructor for now
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // For now, return a success response for frontend testing
        // This will be properly implemented with database integration later
        
        await Task.Delay(100, cancellationToken); // Simulate async operation
        
        return Result<RegisterResponse>.Success(new RegisterResponse
        {
            Success = true,
            Message = "Kayıt başarıyla tamamlandı. (Test Mode)",
            UserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid()
        });
    }
}