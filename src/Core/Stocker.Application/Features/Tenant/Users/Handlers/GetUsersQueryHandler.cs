using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Queries;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, UsersListDto>
{
    public Task<UsersListDto> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        // Mock data for now - will be replaced when ready
        var users = new List<UserDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Ahmet",
                LastName = "Yılmaz",
                Email = "ahmet.yilmaz@demo.com",
                Role = "Admin",
                Department = "Yönetim",
                Branch = "Merkez Ofis",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-30)
            },
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Ayşe",
                LastName = "Kaya",
                Email = "ayse.kaya@demo.com",
                Role = "User",
                Department = "Satış",
                Branch = "Ankara Şube",
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-20)
            },
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Mehmet",
                LastName = "Demir",
                Email = "mehmet.demir@demo.com",
                Role = "Manager",
                Department = "Muhasebe",
                Branch = "İstanbul Şube",
                IsActive = false,
                CreatedDate = DateTime.UtcNow.AddDays(-45)
            }
        };

        var result = new UsersListDto
        {
            Items = users,
            TotalItems = users.Count,
            Page = 1,
            PageSize = 10,
            TotalPages = 1
        };

        return Task.FromResult(result);
    }
}