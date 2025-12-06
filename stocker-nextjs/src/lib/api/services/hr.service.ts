import { ApiService } from '../api-service';
import type {
  // Employee
  EmployeeDto,
  EmployeeSummaryDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  TerminateEmployeeDto,
  EmployeeFilterDto,
  // Department
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentTreeDto,
  // Position
  PositionDto,
  CreatePositionDto,
  UpdatePositionDto,
  // Shift
  ShiftDto,
  CreateShiftDto,
  UpdateShiftDto,
  // Work Schedule
  WorkScheduleDto,
  CreateWorkScheduleDto,
  UpdateWorkScheduleDto,
  AssignWorkScheduleDto,
  // Attendance
  AttendanceDto,
  AttendanceSummaryDto,
  AttendanceReportDto,
  DailyAttendanceSummaryDto,
  CheckInDto,
  CheckOutDto,
  UpdateAttendanceDto,
  AttendanceFilterDto,
  // Leave Type
  LeaveTypeDto,
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  // Leave
  LeaveDto,
  CreateLeaveDto,
  UpdateLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveBalanceDto,
  EmployeeLeaveSummaryDto,
  LeaveFilterDto,
  // Holiday
  HolidayDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  HolidayCalendarDto,
  // Work Location
  WorkLocationDto,
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  // Payroll
  PayrollDto,
  CreatePayrollDto,
  BatchCreatePayrollDto,
  AddPayrollItemDto,
  PayrollSummaryDto,
  ApprovePayrollDto,
  MarkPayrollPaidDto,
  PayrollFilterDto,
  // Expense
  ExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ApproveExpenseDto,
  RejectExpenseDto,
  ExpenseSummaryDto,
  ExpenseFilterDto,
  // Performance
  PerformanceReviewDto,
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
  CompleteReviewDto,
  AcknowledgeReviewDto,
  PerformanceGoalDto,
  CreatePerformanceGoalDto,
  UpdatePerformanceGoalDto,
  UpdateGoalProgressDto,
  PerformanceSummaryDto,
  // Training
  TrainingDto,
  CreateTrainingDto,
  UpdateTrainingDto,
  EmployeeTrainingDto,
  EnrollEmployeeDto,
  CompleteTrainingDto,
  TrainingSummaryDto,
  TrainingFilterDto,
  // Document
  EmployeeDocumentDto,
  CreateEmployeeDocumentDto,
  UpdateEmployeeDocumentDto,
  VerifyDocumentDto,
  ExpiringDocumentsReportDto,
  // Announcement
  AnnouncementDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AcknowledgeAnnouncementDto,
  AnnouncementStatisticsDto,
} from './hr.types';

// =====================================
// HR API SERVICE
// =====================================

export class HRService {
  /**
   * Build HR module API path
   */
  private static getPath(resource: string): string {
    return `/hr/${resource}`;
  }

  // =====================================
  // EMPLOYEES
  // =====================================

  static async getEmployees(filter?: EmployeeFilterDto): Promise<EmployeeSummaryDto[]> {
    return ApiService.get<EmployeeSummaryDto[]>(this.getPath('employees'), { params: filter });
  }

  static async getEmployee(id: number): Promise<EmployeeDto> {
    return ApiService.get<EmployeeDto>(this.getPath(`employees/${id}`));
  }

  static async createEmployee(data: CreateEmployeeDto): Promise<EmployeeDto> {
    return ApiService.post<EmployeeDto>(this.getPath('employees'), data);
  }

  static async updateEmployee(id: number, data: UpdateEmployeeDto): Promise<EmployeeDto> {
    return ApiService.put<EmployeeDto>(this.getPath(`employees/${id}`), data);
  }

  static async deleteEmployee(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`employees/${id}`));
  }

  static async terminateEmployee(id: number, data: TerminateEmployeeDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`employees/${id}/terminate`), data);
  }

  static async activateEmployee(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`employees/${id}/activate`), {});
  }

  static async deactivateEmployee(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`employees/${id}/deactivate`), {});
  }

  // =====================================
  // DEPARTMENTS
  // =====================================

  static async getDepartments(includeInactive: boolean = false): Promise<DepartmentDto[]> {
    return ApiService.get<DepartmentDto[]>(this.getPath('departments'), {
      params: { includeInactive },
    });
  }

  static async getDepartment(id: number): Promise<DepartmentDto> {
    return ApiService.get<DepartmentDto>(this.getPath(`departments/${id}`));
  }

  static async getDepartmentTree(): Promise<DepartmentTreeDto[]> {
    return ApiService.get<DepartmentTreeDto[]>(this.getPath('departments/tree'));
  }

  static async createDepartment(data: CreateDepartmentDto): Promise<DepartmentDto> {
    return ApiService.post<DepartmentDto>(this.getPath('departments'), data);
  }

  static async updateDepartment(id: number, data: UpdateDepartmentDto): Promise<DepartmentDto> {
    return ApiService.put<DepartmentDto>(this.getPath(`departments/${id}`), data);
  }

  static async deleteDepartment(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`departments/${id}`));
  }

  static async activateDepartment(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`departments/${id}/activate`), {});
  }

  static async deactivateDepartment(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`departments/${id}/deactivate`), {});
  }

  // =====================================
  // POSITIONS
  // =====================================

  static async getPositions(departmentId?: number, includeInactive: boolean = false): Promise<PositionDto[]> {
    return ApiService.get<PositionDto[]>(this.getPath('positions'), {
      params: { departmentId, includeInactive },
    });
  }

  static async getPosition(id: number): Promise<PositionDto> {
    return ApiService.get<PositionDto>(this.getPath(`positions/${id}`));
  }

  static async createPosition(data: CreatePositionDto): Promise<PositionDto> {
    return ApiService.post<PositionDto>(this.getPath('positions'), data);
  }

  static async updatePosition(id: number, data: UpdatePositionDto): Promise<PositionDto> {
    return ApiService.put<PositionDto>(this.getPath(`positions/${id}`), data);
  }

  static async deletePosition(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`positions/${id}`));
  }

  static async activatePosition(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`positions/${id}/activate`), {});
  }

  static async deactivatePosition(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`positions/${id}/deactivate`), {});
  }

  // =====================================
  // SHIFTS
  // =====================================

  static async getShifts(includeInactive: boolean = false): Promise<ShiftDto[]> {
    return ApiService.get<ShiftDto[]>(this.getPath('shifts'), {
      params: { includeInactive },
    });
  }

  static async getShift(id: number): Promise<ShiftDto> {
    return ApiService.get<ShiftDto>(this.getPath(`shifts/${id}`));
  }

  static async createShift(data: CreateShiftDto): Promise<ShiftDto> {
    return ApiService.post<ShiftDto>(this.getPath('shifts'), data);
  }

  static async updateShift(id: number, data: UpdateShiftDto): Promise<ShiftDto> {
    return ApiService.put<ShiftDto>(this.getPath(`shifts/${id}`), data);
  }

  static async deleteShift(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`shifts/${id}`));
  }

  static async activateShift(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`shifts/${id}/activate`), {});
  }

  static async deactivateShift(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`shifts/${id}/deactivate`), {});
  }

  // =====================================
  // WORK SCHEDULES
  // =====================================

  static async getWorkSchedules(
    employeeId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<WorkScheduleDto[]> {
    return ApiService.get<WorkScheduleDto[]>(this.getPath('work-schedules'), {
      params: { employeeId, startDate, endDate },
    });
  }

  static async getWorkSchedule(id: number): Promise<WorkScheduleDto> {
    return ApiService.get<WorkScheduleDto>(this.getPath(`work-schedules/${id}`));
  }

  static async createWorkSchedule(data: CreateWorkScheduleDto): Promise<WorkScheduleDto> {
    return ApiService.post<WorkScheduleDto>(this.getPath('work-schedules'), data);
  }

  static async updateWorkSchedule(id: number, data: UpdateWorkScheduleDto): Promise<WorkScheduleDto> {
    return ApiService.put<WorkScheduleDto>(this.getPath(`work-schedules/${id}`), data);
  }

  static async deleteWorkSchedule(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`work-schedules/${id}`));
  }

  static async assignWorkSchedule(data: AssignWorkScheduleDto): Promise<void> {
    return ApiService.post<void>(this.getPath('work-schedules/assign'), data);
  }

  // =====================================
  // ATTENDANCE
  // =====================================

  static async getAttendance(filter?: AttendanceFilterDto): Promise<AttendanceDto[]> {
    return ApiService.get<AttendanceDto[]>(this.getPath('attendance'), { params: filter });
  }

  static async getAttendanceById(id: number): Promise<AttendanceDto> {
    return ApiService.get<AttendanceDto>(this.getPath(`attendance/${id}`));
  }

  static async getDailyAttendance(date: string, departmentId?: number): Promise<DailyAttendanceSummaryDto> {
    return ApiService.get<DailyAttendanceSummaryDto>(this.getPath('attendance/daily'), {
      params: { date, departmentId },
    });
  }

  static async getAttendanceReport(
    year: number,
    month: number,
    employeeId?: number,
    departmentId?: number
  ): Promise<AttendanceReportDto> {
    return ApiService.get<AttendanceReportDto>(this.getPath('attendance/report'), {
      params: { year, month, employeeId, departmentId },
    });
  }

  static async checkIn(data: CheckInDto): Promise<AttendanceDto> {
    return ApiService.post<AttendanceDto>(this.getPath('attendance/check-in'), data);
  }

  static async checkOut(data: CheckOutDto): Promise<AttendanceDto> {
    return ApiService.post<AttendanceDto>(this.getPath('attendance/check-out'), data);
  }

  static async updateAttendance(id: number, data: UpdateAttendanceDto): Promise<AttendanceDto> {
    return ApiService.put<AttendanceDto>(this.getPath(`attendance/${id}`), data);
  }

  // =====================================
  // LEAVE TYPES
  // =====================================

  static async getLeaveTypes(includeInactive: boolean = false): Promise<LeaveTypeDto[]> {
    return ApiService.get<LeaveTypeDto[]>(this.getPath('leave-types'), {
      params: { includeInactive },
    });
  }

  static async getLeaveType(id: number): Promise<LeaveTypeDto> {
    return ApiService.get<LeaveTypeDto>(this.getPath(`leave-types/${id}`));
  }

  static async createLeaveType(data: CreateLeaveTypeDto): Promise<LeaveTypeDto> {
    return ApiService.post<LeaveTypeDto>(this.getPath('leave-types'), data);
  }

  static async updateLeaveType(id: number, data: UpdateLeaveTypeDto): Promise<LeaveTypeDto> {
    return ApiService.put<LeaveTypeDto>(this.getPath(`leave-types/${id}`), data);
  }

  static async deleteLeaveType(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`leave-types/${id}`));
  }

  static async activateLeaveType(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`leave-types/${id}/activate`), {});
  }

  static async deactivateLeaveType(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`leave-types/${id}/deactivate`), {});
  }

  // =====================================
  // LEAVES
  // =====================================

  static async getLeaves(filter?: LeaveFilterDto): Promise<LeaveDto[]> {
    return ApiService.get<LeaveDto[]>(this.getPath('leaves'), { params: filter });
  }

  static async getLeave(id: number): Promise<LeaveDto> {
    return ApiService.get<LeaveDto>(this.getPath(`leaves/${id}`));
  }

  static async createLeave(data: CreateLeaveDto): Promise<LeaveDto> {
    return ApiService.post<LeaveDto>(this.getPath('leaves'), data);
  }

  static async updateLeave(id: number, data: UpdateLeaveDto): Promise<LeaveDto> {
    return ApiService.put<LeaveDto>(this.getPath(`leaves/${id}`), data);
  }

  static async deleteLeave(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`leaves/${id}`));
  }

  static async approveLeave(id: number, data?: ApproveLeaveDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`leaves/${id}/approve`), data || {});
  }

  static async rejectLeave(id: number, data: RejectLeaveDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`leaves/${id}/reject`), data);
  }

  static async cancelLeave(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`leaves/${id}/cancel`), {});
  }

  static async getLeaveBalance(employeeId: number, year?: number): Promise<LeaveBalanceDto[]> {
    return ApiService.get<LeaveBalanceDto[]>(this.getPath(`leaves/balance/${employeeId}`), {
      params: { year },
    });
  }

  static async getEmployeeLeaveSummary(employeeId: number, year?: number): Promise<EmployeeLeaveSummaryDto> {
    return ApiService.get<EmployeeLeaveSummaryDto>(this.getPath(`leaves/summary/${employeeId}`), {
      params: { year },
    });
  }

  // =====================================
  // HOLIDAYS
  // =====================================

  static async getHolidays(year?: number): Promise<HolidayDto[]> {
    return ApiService.get<HolidayDto[]>(this.getPath('holidays'), { params: { year } });
  }

  static async getHoliday(id: number): Promise<HolidayDto> {
    return ApiService.get<HolidayDto>(this.getPath(`holidays/${id}`));
  }

  static async getHolidayCalendar(year: number): Promise<HolidayCalendarDto> {
    return ApiService.get<HolidayCalendarDto>(this.getPath(`holidays/calendar/${year}`));
  }

  static async createHoliday(data: CreateHolidayDto): Promise<HolidayDto> {
    return ApiService.post<HolidayDto>(this.getPath('holidays'), data);
  }

  static async updateHoliday(id: number, data: UpdateHolidayDto): Promise<HolidayDto> {
    return ApiService.put<HolidayDto>(this.getPath(`holidays/${id}`), data);
  }

  static async deleteHoliday(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`holidays/${id}`));
  }

  // =====================================
  // WORK LOCATIONS
  // =====================================

  static async getWorkLocations(includeInactive: boolean = false): Promise<WorkLocationDto[]> {
    return ApiService.get<WorkLocationDto[]>(this.getPath('work-locations'), {
      params: { includeInactive },
    });
  }

  static async getWorkLocation(id: number): Promise<WorkLocationDto> {
    return ApiService.get<WorkLocationDto>(this.getPath(`work-locations/${id}`));
  }

  static async createWorkLocation(data: CreateWorkLocationDto): Promise<WorkLocationDto> {
    return ApiService.post<WorkLocationDto>(this.getPath('work-locations'), data);
  }

  static async updateWorkLocation(id: number, data: UpdateWorkLocationDto): Promise<WorkLocationDto> {
    return ApiService.put<WorkLocationDto>(this.getPath(`work-locations/${id}`), data);
  }

  static async deleteWorkLocation(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`work-locations/${id}`));
  }

  static async activateWorkLocation(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`work-locations/${id}/activate`), {});
  }

  static async deactivateWorkLocation(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`work-locations/${id}/deactivate`), {});
  }

  // =====================================
  // PAYROLL
  // =====================================

  static async getPayrolls(filter?: PayrollFilterDto): Promise<PayrollDto[]> {
    return ApiService.get<PayrollDto[]>(this.getPath('payroll'), { params: filter });
  }

  static async getPayroll(id: number): Promise<PayrollDto> {
    return ApiService.get<PayrollDto>(this.getPath(`payroll/${id}`));
  }

  static async getPayrollSummary(year: number, month: number): Promise<PayrollSummaryDto> {
    return ApiService.get<PayrollSummaryDto>(this.getPath('payroll/summary'), {
      params: { year, month },
    });
  }

  static async createPayroll(data: CreatePayrollDto): Promise<PayrollDto> {
    return ApiService.post<PayrollDto>(this.getPath('payroll'), data);
  }

  static async batchCreatePayroll(data: BatchCreatePayrollDto): Promise<PayrollDto[]> {
    return ApiService.post<PayrollDto[]>(this.getPath('payroll/batch'), data);
  }

  static async calculatePayroll(id: number): Promise<PayrollDto> {
    return ApiService.post<PayrollDto>(this.getPath(`payroll/${id}/calculate`), {});
  }

  static async submitPayrollForApproval(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${id}/submit`), {});
  }

  static async approvePayroll(id: number, data?: ApprovePayrollDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${id}/approve`), data || {});
  }

  static async rejectPayroll(id: number, reason: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${id}/reject`), { reason });
  }

  static async markPayrollPaid(id: number, data?: MarkPayrollPaidDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${id}/mark-paid`), data || {});
  }

  static async cancelPayroll(id: number, reason: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${id}/cancel`), { reason });
  }

  static async addPayrollItem(payrollId: number, data: AddPayrollItemDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`payroll/${payrollId}/items`), data);
  }

  static async deletePayrollItem(payrollId: number, itemId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`payroll/${payrollId}/items/${itemId}`));
  }

  // =====================================
  // EXPENSES
  // =====================================

  static async getExpenses(filter?: ExpenseFilterDto): Promise<ExpenseDto[]> {
    return ApiService.get<ExpenseDto[]>(this.getPath('expenses'), { params: filter });
  }

  static async getExpense(id: number): Promise<ExpenseDto> {
    return ApiService.get<ExpenseDto>(this.getPath(`expenses/${id}`));
  }

  static async getExpenseSummary(employeeId: number, year: number, month: number): Promise<ExpenseSummaryDto> {
    return ApiService.get<ExpenseSummaryDto>(this.getPath('expenses/summary'), {
      params: { employeeId, year, month },
    });
  }

  static async createExpense(data: CreateExpenseDto): Promise<ExpenseDto> {
    return ApiService.post<ExpenseDto>(this.getPath('expenses'), data);
  }

  static async updateExpense(id: number, data: UpdateExpenseDto): Promise<ExpenseDto> {
    return ApiService.put<ExpenseDto>(this.getPath(`expenses/${id}`), data);
  }

  static async deleteExpense(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`expenses/${id}`));
  }

  static async submitExpense(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`expenses/${id}/submit`), {});
  }

  static async approveExpense(id: number, data?: ApproveExpenseDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`expenses/${id}/approve`), data || {});
  }

  static async rejectExpense(id: number, data: RejectExpenseDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`expenses/${id}/reject`), data);
  }

  static async markExpensePaid(id: number, paymentReference?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`expenses/${id}/mark-paid`), { paymentReference });
  }

  static async cancelExpense(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`expenses/${id}/cancel`), {});
  }

  static async uploadExpenseReceipt(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.post<void>(this.getPath(`expenses/${id}/receipt`), formData);
  }

  // =====================================
  // PERFORMANCE REVIEWS
  // =====================================

  static async getPerformanceReviews(
    employeeId?: number,
    reviewerId?: number,
    year?: number
  ): Promise<PerformanceReviewDto[]> {
    return ApiService.get<PerformanceReviewDto[]>(this.getPath('performance/reviews'), {
      params: { employeeId, reviewerId, year },
    });
  }

  static async getPerformanceReview(id: number): Promise<PerformanceReviewDto> {
    return ApiService.get<PerformanceReviewDto>(this.getPath(`performance/reviews/${id}`));
  }

  static async createPerformanceReview(data: CreatePerformanceReviewDto): Promise<PerformanceReviewDto> {
    return ApiService.post<PerformanceReviewDto>(this.getPath('performance/reviews'), data);
  }

  static async updatePerformanceReview(id: number, data: UpdatePerformanceReviewDto): Promise<PerformanceReviewDto> {
    return ApiService.put<PerformanceReviewDto>(this.getPath(`performance/reviews/${id}`), data);
  }

  static async deletePerformanceReview(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`performance/reviews/${id}`));
  }

  static async completePerformanceReview(id: number, data: CompleteReviewDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`performance/reviews/${id}/complete`), data);
  }

  static async acknowledgePerformanceReview(id: number, data?: AcknowledgeReviewDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`performance/reviews/${id}/acknowledge`), data || {});
  }

  // =====================================
  // PERFORMANCE GOALS
  // =====================================

  static async getPerformanceGoals(employeeId?: number, year?: number): Promise<PerformanceGoalDto[]> {
    return ApiService.get<PerformanceGoalDto[]>(this.getPath('performance/goals'), {
      params: { employeeId, year },
    });
  }

  static async getPerformanceGoal(id: number): Promise<PerformanceGoalDto> {
    return ApiService.get<PerformanceGoalDto>(this.getPath(`performance/goals/${id}`));
  }

  static async createPerformanceGoal(data: CreatePerformanceGoalDto): Promise<PerformanceGoalDto> {
    return ApiService.post<PerformanceGoalDto>(this.getPath('performance/goals'), data);
  }

  static async updatePerformanceGoal(id: number, data: UpdatePerformanceGoalDto): Promise<PerformanceGoalDto> {
    return ApiService.put<PerformanceGoalDto>(this.getPath(`performance/goals/${id}`), data);
  }

  static async deletePerformanceGoal(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`performance/goals/${id}`));
  }

  static async updateGoalProgress(id: number, data: UpdateGoalProgressDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`performance/goals/${id}/progress`), data);
  }

  static async getPerformanceSummary(employeeId: number): Promise<PerformanceSummaryDto> {
    return ApiService.get<PerformanceSummaryDto>(this.getPath(`performance/summary/${employeeId}`));
  }

  // =====================================
  // TRAINING
  // =====================================

  static async getTrainings(filter?: TrainingFilterDto): Promise<TrainingDto[]> {
    return ApiService.get<TrainingDto[]>(this.getPath('training'), { params: filter });
  }

  static async getTraining(id: number): Promise<TrainingDto> {
    return ApiService.get<TrainingDto>(this.getPath(`training/${id}`));
  }

  static async createTraining(data: CreateTrainingDto): Promise<TrainingDto> {
    return ApiService.post<TrainingDto>(this.getPath('training'), data);
  }

  static async updateTraining(id: number, data: UpdateTrainingDto): Promise<TrainingDto> {
    return ApiService.put<TrainingDto>(this.getPath(`training/${id}`), data);
  }

  static async deleteTraining(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`training/${id}`));
  }

  static async startTraining(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`training/${id}/start`), {});
  }

  static async completeTrainingProgram(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`training/${id}/complete`), {});
  }

  static async cancelTraining(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`training/${id}/cancel`), {});
  }

  static async getTrainingSummary(): Promise<TrainingSummaryDto> {
    return ApiService.get<TrainingSummaryDto>(this.getPath('training/summary'));
  }

  // =====================================
  // EMPLOYEE TRAINING
  // =====================================

  static async getEmployeeTrainings(
    employeeId?: number,
    trainingId?: number
  ): Promise<EmployeeTrainingDto[]> {
    return ApiService.get<EmployeeTrainingDto[]>(this.getPath('training/enrollments'), {
      params: { employeeId, trainingId },
    });
  }

  static async enrollEmployee(trainingId: number, data: EnrollEmployeeDto): Promise<EmployeeTrainingDto> {
    return ApiService.post<EmployeeTrainingDto>(this.getPath(`training/${trainingId}/enroll`), data);
  }

  static async completeEmployeeTraining(enrollmentId: number, data: CompleteTrainingDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`training/enrollments/${enrollmentId}/complete`), data);
  }

  static async cancelEmployeeTraining(enrollmentId: number, reason?: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`training/enrollments/${enrollmentId}/cancel`), { reason });
  }

  // =====================================
  // DOCUMENTS
  // =====================================

  static async getDocuments(employeeId?: number, documentType?: number): Promise<EmployeeDocumentDto[]> {
    return ApiService.get<EmployeeDocumentDto[]>(this.getPath('documents'), {
      params: { employeeId, documentType },
    });
  }

  static async getEmployeeDocuments(employeeId: number): Promise<EmployeeDocumentDto[]> {
    return ApiService.get<EmployeeDocumentDto[]>(this.getPath(`documents/employee/${employeeId}`));
  }

  static async getDocument(id: number): Promise<EmployeeDocumentDto> {
    return ApiService.get<EmployeeDocumentDto>(this.getPath(`documents/${id}`));
  }

  static async createDocument(data: CreateEmployeeDocumentDto): Promise<EmployeeDocumentDto> {
    return ApiService.post<EmployeeDocumentDto>(this.getPath('documents'), data);
  }

  static async updateDocument(id: number, data: UpdateEmployeeDocumentDto): Promise<EmployeeDocumentDto> {
    return ApiService.put<EmployeeDocumentDto>(this.getPath(`documents/${id}`), data);
  }

  static async deleteDocument(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`documents/${id}`));
  }

  static async verifyDocument(id: number, data?: VerifyDocumentDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`documents/${id}/verify`), data || {});
  }

  static async uploadDocumentFile(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.post<void>(this.getPath(`documents/${id}/upload`), formData);
  }

  static async getExpiringDocuments(days: number = 30): Promise<ExpiringDocumentsReportDto> {
    return ApiService.get<ExpiringDocumentsReportDto>(this.getPath('documents/expiring'), {
      params: { days },
    });
  }

  // =====================================
  // ANNOUNCEMENTS
  // =====================================

  static async getAnnouncements(departmentId?: number, includeExpired?: boolean): Promise<AnnouncementDto[]> {
    return ApiService.get<AnnouncementDto[]>(this.getPath('announcements'), {
      params: { departmentId, includeExpired },
    });
  }

  static async getAnnouncement(id: number): Promise<AnnouncementDto> {
    return ApiService.get<AnnouncementDto>(this.getPath(`announcements/${id}`));
  }

  static async createAnnouncement(data: CreateAnnouncementDto): Promise<AnnouncementDto> {
    return ApiService.post<AnnouncementDto>(this.getPath('announcements'), data);
  }

  static async updateAnnouncement(id: number, data: UpdateAnnouncementDto): Promise<AnnouncementDto> {
    return ApiService.put<AnnouncementDto>(this.getPath(`announcements/${id}`), data);
  }

  static async deleteAnnouncement(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`announcements/${id}`));
  }

  static async publishAnnouncement(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`announcements/${id}/publish`), {});
  }

  static async unpublishAnnouncement(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`announcements/${id}/unpublish`), {});
  }

  static async acknowledgeAnnouncement(id: number, data?: AcknowledgeAnnouncementDto): Promise<void> {
    return ApiService.post<void>(this.getPath(`announcements/${id}/acknowledge`), data || {});
  }

  static async getAnnouncementStatistics(id: number): Promise<AnnouncementStatisticsDto> {
    return ApiService.get<AnnouncementStatisticsDto>(this.getPath(`announcements/${id}/statistics`));
  }
}
