using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.ToggleScheduledReport;

public record ToggleScheduledReportCommand(Guid Id) : IRequest<Result<ScheduledReportDto>>;
