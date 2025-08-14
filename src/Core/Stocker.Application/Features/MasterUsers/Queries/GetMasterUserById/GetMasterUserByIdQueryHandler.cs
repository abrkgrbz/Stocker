using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.MasterUser;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Queries.GetMasterUserById;

public class GetMasterUserByIdQueryHandler : IRequestHandler<GetMasterUserByIdQuery, Result<MasterUserDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetMasterUserByIdQueryHandler> _logger;

    public GetMasterUserByIdQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetMasterUserByIdQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<MasterUserDto>> Handle(GetMasterUserByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .Include(u => u.UserTenants)
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<MasterUserDto>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            var userDto = _mapper.Map<MasterUserDto>(user);

            return Result<MasterUserDto>.Success(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving master user {UserId}", request.UserId);
            return Result<MasterUserDto>.Failure(
                Error.Failure("MasterUser.RetrievalFailed", "Kullanıcı bilgileri yüklenemedi"));
        }
    }
}