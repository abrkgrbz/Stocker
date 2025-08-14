using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.MasterUser;
using Stocker.Application.Extensions;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.CreateMasterUser;

public class CreateMasterUserCommandHandler : IRequestHandler<CreateMasterUserCommand, Result<MasterUserDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IPasswordService _passwordService;
    private readonly IPasswordValidator _passwordValidator;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateMasterUserCommandHandler> _logger;

    public CreateMasterUserCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IPasswordService passwordService,
        IPasswordValidator passwordValidator,
        IMapper mapper,
        ILogger<CreateMasterUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordService = passwordService;
        _passwordValidator = passwordValidator;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<MasterUserDto>> Handle(CreateMasterUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if username already exists
            var existingUser = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);

            if (existingUser != null)
            {
                return Result<MasterUserDto>.Failure(
                    Error.Conflict("MasterUser.UsernameExists", "Bu kullanıcı adı zaten kullanımda"));
            }

            // Check if email already exists
            existingUser = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (existingUser != null)
            {
                return Result<MasterUserDto>.Failure(
                    Error.Conflict("MasterUser.EmailExists", "Bu e-posta adresi zaten kullanımda"));
            }

            // Validate password
            var passwordValidation = _passwordValidator.ValidatePassword(request.Password, request.Username, request.Email);
            if (!passwordValidation.IsSuccess)
            {
                return Result<MasterUserDto>.Failure(passwordValidation.Error);
            }

            // Hash password
            var hashedPassword = _passwordService.CreateHashedPassword(request.Password, request.Username, request.Email);

            // Create master user using the correct overload
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsFailure)
            {
                return Result<MasterUserDto>.Failure(emailResult.Error);
            }
            
            PhoneNumber? phoneNumber = null;
            if (!string.IsNullOrEmpty(request.Phone))
            {
                var phoneResult = PhoneNumber.Create(request.Phone);
                if (phoneResult.IsFailure)
                {
                    return Result<MasterUserDto>.Failure(phoneResult.Error);
                }
                phoneNumber = phoneResult.Value;
            }
            
            var user = MasterUser.Create(
                request.Username,
                emailResult.Value,
                _passwordService.GetCombinedHash(hashedPassword), // Convert to string
                request.FirstName,
                request.LastName,
                phoneNumber);

            // TODO: Add IsSystemAdmin support to MasterUser entity
            // if (request.IsSystemAdmin)
            // {
            //     user.MakeSystemAdmin();
            // }

            // Add to repository
            await _unitOfWork.MasterUsers().AddAsync(user, cancellationToken);

            // If tenant is specified, assign user to tenant
            if (request.TenantId.HasValue && !string.IsNullOrEmpty(request.TenantRole))
            {
                var tenant = await _unitOfWork.Tenants()
                    .GetByIdAsync(request.TenantId.Value, cancellationToken);

                if (tenant != null)
                {
                    user.AssignToTenant(request.TenantId.Value, request.TenantRole);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Map to DTO
            var userDto = _mapper.Map<MasterUserDto>(user);

            _logger.LogInformation("Master user {Username} created successfully with ID: {UserId}", 
                request.Username, user.Id);

            return Result<MasterUserDto>.Success(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating master user {Username}", request.Username);
            return Result<MasterUserDto>.Failure(
                Error.Failure("MasterUser.CreateFailed", "Kullanıcı oluşturma işlemi başarısız oldu"));
        }
    }
}