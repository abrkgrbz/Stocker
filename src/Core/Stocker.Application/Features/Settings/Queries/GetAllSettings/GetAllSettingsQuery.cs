using MediatR;
using Stocker.Application.DTOs.Settings;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Settings.Queries.GetAllSettings;

public class GetAllSettingsQuery : IRequest<Result<SettingsDto>>
{
}