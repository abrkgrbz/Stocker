using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SocialMediaProfiles.Queries;

public record GetSocialMediaProfileByIdQuery(Guid Id) : IRequest<Result<SocialMediaProfileDto?>>;
