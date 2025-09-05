using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Queries;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailDto?>
{
    public Task<UserDetailDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        // Mock implementation - will be replaced when ready
        var user = new UserDetailDto
        {
            Id = request.UserId,
            Username = "testuser",
            Email = "test.user@demo.com",
            FirstName = "Test",
            LastName = "User",
            Phone = "+90 555 123 4567",
            Role = "User",
            Department = "Default",
            Branch = "Merkez",
            IsActive = true,
            TwoFactorEnabled = false,
            EmailConfirmed = true,
            PhoneConfirmed = false,
            LastLoginDate = DateTime.UtcNow.AddHours(-2),
            LastPasswordChangeDate = DateTime.UtcNow.AddDays(-30),
            CreatedDate = DateTime.UtcNow.AddDays(-10),
            Permissions = new List<string> { "View", "Edit" },
            LoginHistory = new List<LoginHistoryDto>
            {
                new() { Date = DateTime.UtcNow.AddHours(-2), IpAddress = "192.168.1.1", Device = "Chrome", Status = "Success" },
                new() { Date = DateTime.UtcNow.AddDays(-1), IpAddress = "192.168.1.1", Device = "Chrome", Status = "Success" }
            }
        };

        return Task.FromResult<UserDetailDto?>(user);
    }
}