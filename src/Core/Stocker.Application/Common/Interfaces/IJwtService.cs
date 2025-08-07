using Stocker.Application.DTOs.Auth;

namespace Stocker.Application.Common.Interfaces;

public interface IJwtService
{
    AuthTokenDto GenerateToken(Guid userId, string email, string userName, Guid? tenantId, string role, IEnumerable<string> permissions);
    bool ValidateToken(string token);
    Dictionary<string, string> GetClaimsFromToken(string token);
}