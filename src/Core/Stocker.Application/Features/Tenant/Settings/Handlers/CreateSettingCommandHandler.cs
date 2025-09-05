using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Commands;
using Stocker.Domain.Tenant.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class CreateSettingCommandHandler : IRequestHandler<CreateSettingCommand, SettingDto>
{
    private readonly TenantDbContext _context;
    private readonly IMapper _mapper;

    public CreateSettingCommandHandler(TenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SettingDto> Handle(CreateSettingCommand request, CancellationToken cancellationToken)
    {
        // Check if setting already exists
        var existingSetting = await _context.TenantSettings
            .AnyAsync(s => s.TenantId == request.TenantId && s.SettingKey == request.SettingKey, 
                cancellationToken);

        if (existingSetting)
        {
            throw new InvalidOperationException($"Setting with key '{request.SettingKey}' already exists.");
        }

        var setting = TenantSettings.Create(
            request.TenantId,
            request.SettingKey,
            request.SettingValue,
            request.Category,
            request.DataType,
            request.Description,
            request.IsSystemSetting,
            request.IsEncrypted,
            request.IsPublic);

        _context.TenantSettings.Add(setting);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SettingDto>(setting);
    }
}