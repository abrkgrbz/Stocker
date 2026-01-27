using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.ScheduleReport;

public record ScheduleReportCommand(
    ScheduleReportRequest Request,
    string CurrentUserEmail) : IRequest<Result<ScheduledReportDto>>;
