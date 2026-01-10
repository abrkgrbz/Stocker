using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for expense submitted events - sends notification to approver
/// </summary>
public sealed class ExpenseSubmittedEventHandler : INotificationHandler<ExpenseSubmittedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<ExpenseSubmittedEventHandler> _logger;

    public ExpenseSubmittedEventHandler(
        IHrNotificationService notificationService,
        ILogger<ExpenseSubmittedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ExpenseSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Expense submitted: {ExpenseId} - {EmployeeName}, Type: {ExpenseType}, Amount: {Amount} {Currency}",
            notification.ExpenseId,
            notification.EmployeeName,
            notification.ExpenseType,
            notification.Amount,
            notification.Currency);

        await _notificationService.SendExpenseSubmittedAsync(
            notification.TenantId,
            notification.ExpenseId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.ExpenseType,
            notification.Amount,
            notification.Currency,
            notification.ApproverId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for expense approved events - sends notification to employee
/// </summary>
public sealed class ExpenseApprovedEventHandler : INotificationHandler<ExpenseApprovedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<ExpenseApprovedEventHandler> _logger;

    public ExpenseApprovedEventHandler(
        IHrNotificationService notificationService,
        ILogger<ExpenseApprovedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ExpenseApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ Expense approved: {ExpenseId} - {EmployeeName}, Amount: {Amount} {Currency}, Approved by: {ApprovedByName}",
            notification.ExpenseId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            notification.ApprovedByName);

        await _notificationService.SendExpenseApprovedAsync(
            notification.TenantId,
            notification.ExpenseId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            cancellationToken);
    }
}

/// <summary>
/// Handler for expense rejected events - sends notification to employee
/// </summary>
public sealed class ExpenseRejectedEventHandler : INotificationHandler<ExpenseRejectedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<ExpenseRejectedEventHandler> _logger;

    public ExpenseRejectedEventHandler(
        IHrNotificationService notificationService,
        ILogger<ExpenseRejectedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ExpenseRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "❌ Expense rejected: {ExpenseId} - {EmployeeName}, Amount: {Amount} {Currency}, Reason: {RejectionReason}",
            notification.ExpenseId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            notification.RejectionReason);

        await _notificationService.SendExpenseRejectedAsync(
            notification.TenantId,
            notification.ExpenseId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Amount,
            notification.RejectionReason,
            cancellationToken);
    }
}

/// <summary>
/// Handler for expense paid events
/// </summary>
public sealed class ExpensePaidEventHandler : INotificationHandler<ExpensePaidDomainEvent>
{
    private readonly ILogger<ExpensePaidEventHandler> _logger;

    public ExpensePaidEventHandler(ILogger<ExpensePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpensePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "💰 Expense paid: {ExpenseId} - {EmployeeName}, Amount: {Amount} {Currency}, Date: {PaymentDate:d}",
            notification.ExpenseId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            notification.PaymentDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for expense cancelled events
/// </summary>
public sealed class ExpenseCancelledEventHandler : INotificationHandler<ExpenseCancelledDomainEvent>
{
    private readonly ILogger<ExpenseCancelledEventHandler> _logger;

    public ExpenseCancelledEventHandler(ILogger<ExpenseCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpenseCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Expense cancelled: {ExpenseId} - {EmployeeName}, Type: {ExpenseType}, Amount: {Amount}",
            notification.ExpenseId,
            notification.EmployeeName,
            notification.ExpenseType,
            notification.Amount);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for expense budget exceeded events - sends notification to manager
/// </summary>
public sealed class ExpenseBudgetExceededEventHandler : INotificationHandler<ExpenseBudgetExceededDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<ExpenseBudgetExceededEventHandler> _logger;

    public ExpenseBudgetExceededEventHandler(
        IHrNotificationService notificationService,
        ILogger<ExpenseBudgetExceededEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ExpenseBudgetExceededDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "🚨 Expense budget exceeded: {EmployeeId} - {EmployeeName}, Category: {BudgetCategory}, Limit: {BudgetLimit}, Excess: {ExcessAmount}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BudgetCategory,
            notification.BudgetLimit,
            notification.ExcessAmount);

        await _notificationService.SendExpenseBudgetExceededAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BudgetCategory,
            notification.BudgetLimit,
            notification.ExcessAmount,
            notification.ManagerId,
            cancellationToken);
    }
}
