using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.BaBsForms.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.BaBsForms.Commands;

/// <summary>
/// Command to create a new Ba-Bs form
/// </summary>
public class CreateBaBsFormCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateBaBsFormDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateBaBsFormCommand
/// </summary>
public class CreateBaBsFormCommandHandler : IRequestHandler<CreateBaBsFormCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateBaBsFormCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(CreateBaBsFormCommand request, CancellationToken cancellationToken)
    {
        // Check if form already exists for period
        var exists = await _unitOfWork.BaBsForms.ExistsForPeriodAsync(
            request.Data.FormType,
            request.Data.PeriodYear,
            request.Data.PeriodMonth,
            cancellationToken);

        if (exists)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Conflict("BaBsForm", $"Bu dönem için {request.Data.FormType} formu zaten mevcut"));
        }

        // Generate form number
        var formNumber = await _unitOfWork.BaBsForms.GetNextFormNumberAsync(
            request.Data.FormType,
            request.Data.PeriodYear,
            request.Data.PeriodMonth,
            cancellationToken);

        // Create form
        BaBsForm form;
        if (request.Data.FormType == BaBsFormType.Ba)
        {
            form = BaBsForm.CreateBaForm(
                formNumber,
                request.Data.PeriodYear,
                request.Data.PeriodMonth,
                request.Data.TaxId,
                request.Data.CompanyName);
        }
        else
        {
            form = BaBsForm.CreateBsForm(
                formNumber,
                request.Data.PeriodYear,
                request.Data.PeriodMonth,
                request.Data.TaxId,
                request.Data.CompanyName);
        }

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.TaxOffice))
        {
            form.SetTaxOffice(request.Data.TaxOffice);
        }

        if (request.Data.AccountingPeriodId.HasValue)
        {
            form.SetAccountingPeriodId(request.Data.AccountingPeriodId);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            form.SetNotes(request.Data.Notes);
        }

        // Add items if provided
        if (request.Data.Items != null && request.Data.Items.Any())
        {
            foreach (var itemDto in request.Data.Items)
            {
                try
                {
                    var amountExclVat = Money.Create(itemDto.AmountExcludingVat, "TRY");
                    var vatAmount = Money.Create(itemDto.VatAmount, "TRY");

                    form.AddItem(
                        itemDto.CounterpartyTaxId,
                        itemDto.CounterpartyName,
                        itemDto.CountryCode ?? "TR",
                        itemDto.DocumentCount,
                        amountExclVat,
                        vatAmount,
                        itemDto.DocumentType);
                }
                catch (InvalidOperationException)
                {
                    // Skip items below 5000 TL threshold silently
                    continue;
                }
            }
        }

        // Save
        await _unitOfWork.BaBsForms.AddAsync(form, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return DTO
        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to add item to Ba-Bs form
/// </summary>
public class AddBaBsFormItemCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FormId { get; set; }
    public CreateBaBsFormItemDto Item { get; set; } = null!;
}

/// <summary>
/// Handler for AddBaBsFormItemCommand
/// </summary>
public class AddBaBsFormItemCommandHandler : IRequestHandler<AddBaBsFormItemCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public AddBaBsFormItemCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(AddBaBsFormItemCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.FormId, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.FormId} ile Ba-Bs formu bulunamadı"));
        }

        if (form.Status != BaBsFormStatus.Draft)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.Status", "Sadece taslak formlara kalem eklenebilir"));
        }

        try
        {
            var amountExclVat = Money.Create(request.Item.AmountExcludingVat, "TRY");
            var vatAmount = Money.Create(request.Item.VatAmount, "TRY");

            form.AddItem(
                request.Item.CounterpartyTaxId,
                request.Item.CounterpartyName,
                request.Item.CountryCode ?? "TR",
                request.Item.DocumentCount,
                amountExclVat,
                vatAmount,
                request.Item.DocumentType);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.Item", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to mark Ba-Bs form as ready
/// </summary>
public class MarkBaBsFormReadyCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string PreparedBy { get; set; } = string.Empty;
}

/// <summary>
/// Handler for MarkBaBsFormReadyCommand
/// </summary>
public class MarkBaBsFormReadyCommandHandler : IRequestHandler<MarkBaBsFormReadyCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkBaBsFormReadyCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(MarkBaBsFormReadyCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        try
        {
            form.MarkAsReady(request.PreparedBy);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.MarkReady", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to approve Ba-Bs form
/// </summary>
public class ApproveBaBsFormCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string ApprovedBy { get; set; } = string.Empty;
    public string? Note { get; set; }
}

/// <summary>
/// Handler for ApproveBaBsFormCommand
/// </summary>
public class ApproveBaBsFormCommandHandler : IRequestHandler<ApproveBaBsFormCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveBaBsFormCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(ApproveBaBsFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        try
        {
            form.Approve(request.ApprovedBy);

            if (!string.IsNullOrEmpty(request.Note))
            {
                form.SetNotes($"Onay notu: {request.Note}. {form.Notes}");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to file Ba-Bs form to GİB
/// </summary>
public class FileBaBsFormCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? GibSubmissionReference { get; set; }
}

/// <summary>
/// Handler for FileBaBsFormCommand
/// </summary>
public class FileBaBsFormCommandHandler : IRequestHandler<FileBaBsFormCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public FileBaBsFormCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(FileBaBsFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        try
        {
            form.File(DateTime.UtcNow, request.GibSubmissionReference);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.File", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to record GİB result for Ba-Bs form
/// </summary>
public class RecordBaBsGibResultCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public BaBsGibResultDto Result { get; set; } = null!;
}

/// <summary>
/// Handler for RecordBaBsGibResultCommand
/// </summary>
public class RecordBaBsGibResultCommandHandler : IRequestHandler<RecordBaBsGibResultCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RecordBaBsGibResultCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(RecordBaBsGibResultCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        try
        {
            if (request.Result.IsAccepted && !string.IsNullOrEmpty(request.Result.ApprovalNumber))
            {
                form.RecordGibApproval(request.Result.ApprovalNumber);
            }
            else if (!request.Result.IsAccepted)
            {
                form.RecordGibRejection(request.Result.RejectionReason ?? "Bilinmeyen red nedeni");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.GibResult", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to create correction Ba-Bs form
/// </summary>
public class CreateBaBsCorrectionCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int OriginalFormId { get; set; }
    public string CorrectionReason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for CreateBaBsCorrectionCommand
/// </summary>
public class CreateBaBsCorrectionCommandHandler : IRequestHandler<CreateBaBsCorrectionCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateBaBsCorrectionCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(CreateBaBsCorrectionCommand request, CancellationToken cancellationToken)
    {
        var originalForm = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.OriginalFormId, cancellationToken);
        if (originalForm == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.OriginalFormId} ile Ba-Bs formu bulunamadı"));
        }

        // Generate correction form number
        var correctionNumber = await _unitOfWork.BaBsForms.GetNextFormNumberAsync(
            originalForm.FormType,
            originalForm.PeriodYear,
            originalForm.PeriodMonth,
            cancellationToken);

        try
        {
            var correctionForm = originalForm.CreateCorrection(correctionNumber, request.CorrectionReason);

            await _unitOfWork.BaBsForms.AddAsync(correctionForm, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = GetBaBsFormByIdQueryHandler.MapToDto(correctionForm);
            return Result<BaBsFormDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.CreateCorrection", ex.Message));
        }
    }
}

/// <summary>
/// Command to cancel Ba-Bs form
/// </summary>
public class CancelBaBsFormCommand : IRequest<Result<BaBsFormDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for CancelBaBsFormCommand
/// </summary>
public class CancelBaBsFormCommandHandler : IRequestHandler<CancelBaBsFormCommand, Result<BaBsFormDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelBaBsFormCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BaBsFormDto>> Handle(CancelBaBsFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<BaBsFormDto>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        try
        {
            form.Cancel(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<BaBsFormDto>.Failure(
                Error.Validation("BaBsForm.Cancel", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetBaBsFormByIdQueryHandler.MapToDto(form);
        return Result<BaBsFormDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete Ba-Bs form
/// </summary>
public class DeleteBaBsFormCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteBaBsFormCommand
/// </summary>
public class DeleteBaBsFormCommandHandler : IRequestHandler<DeleteBaBsFormCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteBaBsFormCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteBaBsFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _unitOfWork.BaBsForms.GetWithItemsAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("BaBsForm", $"ID {request.Id} ile Ba-Bs formu bulunamadı"));
        }

        if (form.Status != BaBsFormStatus.Draft && form.Status != BaBsFormStatus.Cancelled)
        {
            return Result<bool>.Failure(
                Error.Validation("BaBsForm.Delete", "Sadece taslak veya iptal edilmiş formlar silinebilir"));
        }

        _unitOfWork.BaBsForms.Remove(form);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
