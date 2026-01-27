using MediatR;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.GenerateReport;

public record GenerateReportCommand(
    GenerateReportRequest Request,
    string CurrentUserEmail) : IRequest<Result<ReportResultDto>>;
