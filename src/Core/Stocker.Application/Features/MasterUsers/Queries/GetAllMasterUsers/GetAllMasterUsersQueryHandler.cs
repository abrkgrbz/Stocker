using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.MasterUser;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Queries.GetAllMasterUsers;

public class GetAllMasterUsersQueryHandler : IRequestHandler<GetAllMasterUsersQuery, Result<List<MasterUserDto>>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllMasterUsersQueryHandler> _logger;

    public GetAllMasterUsersQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetAllMasterUsersQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<MasterUserDto>>> Handle(GetAllMasterUsersQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _unitOfWork.MasterUsers()
                .AsQueryable()
                .Include(u => u.UserTenants)
                .AsQueryable();

            // Filter by active status
            if (!request.IncludeInactive)
            {
                query = query.Where(u => u.IsActive);
            }

            // Filter by search term
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(u => 
                    u.Username.ToLower().Contains(searchTerm) ||
                    u.Email.Value.ToLower().Contains(searchTerm) ||
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm));
            }

            // Filter by role
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                query = query.Where(u => u.UserTenants.Any(ut => ut.Role == request.Role));
            }

            // Filter by tenant
            if (request.TenantId.HasValue)
            {
                query = query.Where(u => u.UserTenants.Any(ut => ut.TenantId == request.TenantId.Value));
            }

            var users = await query
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync(cancellationToken);

            var userDtos = _mapper.Map<List<MasterUserDto>>(users);

            return Result<List<MasterUserDto>>.Success(userDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving master users");
            return Result<List<MasterUserDto>>.Failure(
                Error.Failure("MasterUsers.RetrievalFailed", "Kullanıcılar yüklenemedi"));
        }
    }
}