/**
 * React Query Hooks for HR Module
 * Comprehensive hooks for all HR endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HRService } from '../services/hr.service';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  // Employee
  EmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  TerminateEmployeeDto,
  EmployeeFilterDto,
  // Department
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
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
  LeaveFilterDto,
  // Holiday
  HolidayDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  // Work Location
  WorkLocationDto,
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  // Payroll
  PayrollDto,
  CreatePayrollDto,
  BatchCreatePayrollDto,
  AddPayrollItemDto,
  ApprovePayrollDto,
  MarkPayrollPaidDto,
  PayrollFilterDto,
  // Expense
  ExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ApproveExpenseDto,
  RejectExpenseDto,
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
  // Training
  TrainingDto,
  CreateTrainingDto,
  UpdateTrainingDto,
  EnrollEmployeeDto,
  CompleteTrainingDto,
  TrainingFilterDto,
  // Document
  EmployeeDocumentDto,
  CreateEmployeeDocumentDto,
  UpdateEmployeeDocumentDto,
  VerifyDocumentDto,
  // Announcement
  AnnouncementDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AcknowledgeAnnouncementDto,
} from '../services/hr.types';

// =====================================
// QUERY KEYS
// =====================================

export const hrKeys = {
  // Employees
  employees: ['hr', 'employees'] as const,
  employee: (id: number) => ['hr', 'employees', id] as const,
  employeesFiltered: (filter?: EmployeeFilterDto) => ['hr', 'employees', 'filtered', filter] as const,

  // Departments
  departments: ['hr', 'departments'] as const,
  department: (id: number) => ['hr', 'departments', id] as const,
  departmentTree: ['hr', 'departments', 'tree'] as const,

  // Positions
  positions: ['hr', 'positions'] as const,
  position: (id: number) => ['hr', 'positions', id] as const,
  positionsFiltered: (departmentId?: number) => ['hr', 'positions', 'filtered', departmentId] as const,

  // Shifts
  shifts: ['hr', 'shifts'] as const,
  shift: (id: number) => ['hr', 'shifts', id] as const,

  // Work Schedules
  workSchedules: ['hr', 'work-schedules'] as const,
  workSchedule: (id: number) => ['hr', 'work-schedules', id] as const,
  workSchedulesFiltered: (employeeId?: number, startDate?: string, endDate?: string) =>
    ['hr', 'work-schedules', 'filtered', { employeeId, startDate, endDate }] as const,

  // Attendance
  attendance: ['hr', 'attendance'] as const,
  attendanceById: (id: number) => ['hr', 'attendance', id] as const,
  attendanceFiltered: (filter?: AttendanceFilterDto) => ['hr', 'attendance', 'filtered', filter] as const,
  attendanceDaily: (date: string, departmentId?: number) =>
    ['hr', 'attendance', 'daily', date, departmentId] as const,
  attendanceReport: (year: number, month: number, employeeId?: number, departmentId?: number) =>
    ['hr', 'attendance', 'report', { year, month, employeeId, departmentId }] as const,

  // Leave Types
  leaveTypes: ['hr', 'leave-types'] as const,
  leaveType: (id: number) => ['hr', 'leave-types', id] as const,

  // Leaves
  leaves: ['hr', 'leaves'] as const,
  leave: (id: number) => ['hr', 'leaves', id] as const,
  leavesFiltered: (filter?: LeaveFilterDto) => ['hr', 'leaves', 'filtered', filter] as const,
  leaveBalance: (employeeId: number, year?: number) =>
    ['hr', 'leaves', 'balance', employeeId, year] as const,
  leaveSummary: (employeeId: number, year?: number) =>
    ['hr', 'leaves', 'summary', employeeId, year] as const,

  // Holidays
  holidays: ['hr', 'holidays'] as const,
  holiday: (id: number) => ['hr', 'holidays', id] as const,
  holidayCalendar: (year: number) => ['hr', 'holidays', 'calendar', year] as const,

  // Work Locations
  workLocations: ['hr', 'work-locations'] as const,
  workLocation: (id: number) => ['hr', 'work-locations', id] as const,

  // Payroll
  payroll: ['hr', 'payroll'] as const,
  payrollById: (id: number) => ['hr', 'payroll', id] as const,
  payrollFiltered: (filter?: PayrollFilterDto) => ['hr', 'payroll', 'filtered', filter] as const,
  payrollSummary: (year: number, month: number) => ['hr', 'payroll', 'summary', year, month] as const,

  // Expenses
  expenses: ['hr', 'expenses'] as const,
  expense: (id: number) => ['hr', 'expenses', id] as const,
  expensesFiltered: (filter?: ExpenseFilterDto) => ['hr', 'expenses', 'filtered', filter] as const,
  expenseSummary: (employeeId: number, year: number, month: number) =>
    ['hr', 'expenses', 'summary', { employeeId, year, month }] as const,

  // Performance Reviews
  performanceReviews: ['hr', 'performance', 'reviews'] as const,
  performanceReview: (id: number) => ['hr', 'performance', 'reviews', id] as const,
  performanceReviewsFiltered: (employeeId?: number, reviewerId?: number, year?: number) =>
    ['hr', 'performance', 'reviews', 'filtered', { employeeId, reviewerId, year }] as const,

  // Performance Goals
  performanceGoals: ['hr', 'performance', 'goals'] as const,
  performanceGoal: (id: number) => ['hr', 'performance', 'goals', id] as const,
  performanceGoalsFiltered: (employeeId?: number, year?: number) =>
    ['hr', 'performance', 'goals', 'filtered', { employeeId, year }] as const,
  performanceSummary: (employeeId: number) =>
    ['hr', 'performance', 'summary', employeeId] as const,

  // Training
  trainings: ['hr', 'training'] as const,
  training: (id: number) => ['hr', 'training', id] as const,
  trainingsFiltered: (filter?: TrainingFilterDto) => ['hr', 'training', 'filtered', filter] as const,
  trainingSummary: ['hr', 'training', 'summary'] as const,

  // Employee Training
  employeeTrainings: ['hr', 'training', 'enrollments'] as const,
  employeeTrainingsFiltered: (employeeId?: number, trainingId?: number) =>
    ['hr', 'training', 'enrollments', 'filtered', { employeeId, trainingId }] as const,

  // Documents
  documents: ['hr', 'documents'] as const,
  document: (id: number) => ['hr', 'documents', id] as const,
  employeeDocuments: (employeeId: number) => ['hr', 'documents', 'employee', employeeId] as const,
  expiringDocuments: (days: number) => ['hr', 'documents', 'expiring', days] as const,

  // Announcements
  announcements: ['hr', 'announcements'] as const,
  announcement: (id: number) => ['hr', 'announcements', id] as const,
  announcementStatistics: (id: number) => ['hr', 'announcements', id, 'statistics'] as const,
};

// =====================================
// EMPLOYEES HOOKS
// =====================================

export function useEmployees(filter?: EmployeeFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.employeesFiltered(filter) : hrKeys.employees,
    queryFn: () => HRService.getEmployees(filter),
    staleTime: 30000,
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: hrKeys.employee(id),
    queryFn: () => HRService.getEmployee(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => HRService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan oluşturulamadı');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
      HRService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan güncellenemedi');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan silindi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan silinemedi');
    },
  });
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TerminateEmployeeDto }) =>
      HRService.terminateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan işten çıkış işlemi tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'İşten çıkış işlemi başarısız');
    },
  });
}

export function useActivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activateEmployee(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan aktifleştirilemedi');
    },
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivateEmployee(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Çalışan pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan pasifleştirilemedi');
    },
  });
}

// =====================================
// DEPARTMENTS HOOKS
// =====================================

export function useDepartments(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...hrKeys.departments, { includeInactive }],
    queryFn: () => HRService.getDepartments(includeInactive),
    staleTime: 60000,
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: hrKeys.department(id),
    queryFn: () => HRService.getDepartment(id),
    enabled: !!id && id > 0,
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: hrKeys.departmentTree,
    queryFn: () => HRService.getDepartmentTree(),
    staleTime: 60000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => HRService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.departments });
      queryClient.invalidateQueries({ queryKey: hrKeys.departmentTree });
      showSuccess('Departman oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Departman oluşturulamadı');
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentDto }) =>
      HRService.updateDepartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.department(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.departments });
      queryClient.invalidateQueries({ queryKey: hrKeys.departmentTree });
      showSuccess('Departman güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Departman güncellenemedi');
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.departments });
      queryClient.invalidateQueries({ queryKey: hrKeys.departmentTree });
      showSuccess('Departman silindi');
    },
    onError: (error) => {
      showApiError(error, 'Departman silinemedi');
    },
  });
}

export function useActivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activateDepartment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.department(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.departments });
      showSuccess('Departman aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Departman aktifleştirilemedi');
    },
  });
}

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivateDepartment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.department(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.departments });
      showSuccess('Departman pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Departman pasifleştirilemedi');
    },
  });
}

// =====================================
// POSITIONS HOOKS
// =====================================

export function usePositions(departmentId?: number, includeInactive: boolean = false) {
  return useQuery({
    queryKey: departmentId
      ? hrKeys.positionsFiltered(departmentId)
      : [...hrKeys.positions, { includeInactive }],
    queryFn: () => HRService.getPositions(departmentId, includeInactive),
    staleTime: 60000,
  });
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: hrKeys.position(id),
    queryFn: () => HRService.getPosition(id),
    enabled: !!id && id > 0,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePositionDto) => HRService.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.positions });
      showSuccess('Pozisyon oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Pozisyon oluşturulamadı');
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionDto }) =>
      HRService.updatePosition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.position(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.positions });
      showSuccess('Pozisyon güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Pozisyon güncellenemedi');
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.positions });
      showSuccess('Pozisyon silindi');
    },
    onError: (error) => {
      showApiError(error, 'Pozisyon silinemedi');
    },
  });
}

export function useActivatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activatePosition(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.position(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.positions });
      showSuccess('Pozisyon aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Pozisyon aktifleştirilemedi');
    },
  });
}

export function useDeactivatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivatePosition(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.position(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.positions });
      showSuccess('Pozisyon pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Pozisyon pasifleştirilemedi');
    },
  });
}

// =====================================
// SHIFTS HOOKS
// =====================================

export function useShifts(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...hrKeys.shifts, { includeInactive }],
    queryFn: () => HRService.getShifts(includeInactive),
    staleTime: 60000,
  });
}

export function useShift(id: number) {
  return useQuery({
    queryKey: hrKeys.shift(id),
    queryFn: () => HRService.getShift(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftDto) => HRService.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.shifts });
      showSuccess('Vardiya oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Vardiya oluşturulamadı');
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShiftDto }) =>
      HRService.updateShift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.shift(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.shifts });
      showSuccess('Vardiya güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Vardiya güncellenemedi');
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.shifts });
      showSuccess('Vardiya silindi');
    },
    onError: (error) => {
      showApiError(error, 'Vardiya silinemedi');
    },
  });
}

export function useActivateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activateShift(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.shift(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.shifts });
      showSuccess('Vardiya aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Vardiya aktifleştirilemedi');
    },
  });
}

export function useDeactivateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivateShift(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.shift(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.shifts });
      showSuccess('Vardiya pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Vardiya pasifleştirilemedi');
    },
  });
}

// =====================================
// WORK SCHEDULES HOOKS
// =====================================

export function useWorkSchedules(employeeId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: hrKeys.workSchedulesFiltered(employeeId, startDate, endDate),
    queryFn: () => HRService.getWorkSchedules(employeeId, startDate, endDate),
    staleTime: 30000,
  });
}

export function useWorkSchedule(id: number) {
  return useQuery({
    queryKey: hrKeys.workSchedule(id),
    queryFn: () => HRService.getWorkSchedule(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkScheduleDto) => HRService.createWorkSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workSchedules });
      showSuccess('Çalışma programı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma programı oluşturulamadı');
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkScheduleDto }) =>
      HRService.updateWorkSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workSchedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.workSchedules });
      showSuccess('Çalışma programı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma programı güncellenemedi');
    },
  });
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteWorkSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workSchedules });
      showSuccess('Çalışma programı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma programı silinemedi');
    },
  });
}

export function useAssignWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignWorkScheduleDto) => HRService.assignWorkSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workSchedules });
      showSuccess('Çalışma programı atandı');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma programı atanamadı');
    },
  });
}

// =====================================
// ATTENDANCE HOOKS
// =====================================

export function useAttendance(filter?: AttendanceFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.attendanceFiltered(filter) : hrKeys.attendance,
    queryFn: () => HRService.getAttendance(filter),
    staleTime: 30000,
  });
}

export function useAttendanceById(id: number) {
  return useQuery({
    queryKey: hrKeys.attendanceById(id),
    queryFn: () => HRService.getAttendanceById(id),
    enabled: !!id && id > 0,
  });
}

export function useDailyAttendance(date: string, departmentId?: number) {
  return useQuery({
    queryKey: hrKeys.attendanceDaily(date, departmentId),
    queryFn: () => HRService.getDailyAttendance(date, departmentId),
    staleTime: 60000,
  });
}

export function useAttendanceReport(
  year: number,
  month: number,
  employeeId?: number,
  departmentId?: number
) {
  return useQuery({
    queryKey: hrKeys.attendanceReport(year, month, employeeId, departmentId),
    queryFn: () => HRService.getAttendanceReport(year, month, employeeId, departmentId),
    staleTime: 60000,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInDto) => HRService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance });
      showSuccess('Giriş kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Giriş kaydedilemedi');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutDto) => HRService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance });
      showSuccess('Çıkış kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Çıkış kaydedilemedi');
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttendanceDto }) =>
      HRService.updateAttendance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendanceById(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance });
      showSuccess('Devam kaydı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Devam kaydı güncellenemedi');
    },
  });
}

// =====================================
// LEAVE TYPES HOOKS
// =====================================

export function useLeaveTypes(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...hrKeys.leaveTypes, { includeInactive }],
    queryFn: () => HRService.getLeaveTypes(includeInactive),
    staleTime: 60000,
  });
}

export function useLeaveType(id: number) {
  return useQuery({
    queryKey: hrKeys.leaveType(id),
    queryFn: () => HRService.getLeaveType(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveTypeDto) => HRService.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveTypes });
      showSuccess('İzin türü oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İzin türü oluşturulamadı');
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveTypeDto }) =>
      HRService.updateLeaveType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveType(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveTypes });
      showSuccess('İzin türü güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İzin türü güncellenemedi');
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveTypes });
      showSuccess('İzin türü silindi');
    },
    onError: (error) => {
      showApiError(error, 'İzin türü silinemedi');
    },
  });
}

export function useActivateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activateLeaveType(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveType(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveTypes });
      showSuccess('İzin türü aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'İzin türü aktifleştirilemedi');
    },
  });
}

export function useDeactivateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivateLeaveType(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveType(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaveTypes });
      showSuccess('İzin türü pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'İzin türü pasifleştirilemedi');
    },
  });
}

// =====================================
// LEAVES HOOKS
// =====================================

export function useLeaves(filter?: LeaveFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.leavesFiltered(filter) : hrKeys.leaves,
    queryFn: () => HRService.getLeaves(filter),
    staleTime: 30000,
  });
}

export function useLeave(id: number) {
  return useQuery({
    queryKey: hrKeys.leave(id),
    queryFn: () => HRService.getLeave(id),
    enabled: !!id && id > 0,
  });
}

export function useLeaveBalance(employeeId: number, year?: number) {
  return useQuery({
    queryKey: hrKeys.leaveBalance(employeeId, year),
    queryFn: () => HRService.getLeaveBalance(employeeId, year),
    enabled: !!employeeId && employeeId > 0,
    staleTime: 60000,
  });
}

export function useEmployeeLeaveSummary(employeeId: number, year?: number) {
  return useQuery({
    queryKey: hrKeys.leaveSummary(employeeId, year),
    queryFn: () => HRService.getEmployeeLeaveSummary(employeeId, year),
    enabled: !!employeeId && employeeId > 0,
    staleTime: 60000,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveDto) => HRService.createLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi oluşturulamadı');
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveDto }) =>
      HRService.updateLeave(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi güncellenemedi');
    },
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi silindi');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi silinemedi');
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveLeaveDto }) =>
      HRService.approveLeave(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi onaylanamadı');
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectLeaveDto }) =>
      HRService.rejectLeave(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi reddedilemedi');
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.cancelLeave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves });
      showSuccess('İzin talebi iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'İzin talebi iptal edilemedi');
    },
  });
}

// =====================================
// HOLIDAYS HOOKS
// =====================================

export function useHolidays(year?: number) {
  return useQuery({
    queryKey: [...hrKeys.holidays, { year }],
    queryFn: () => HRService.getHolidays(year),
    staleTime: 60000,
  });
}

export function useHoliday(id: number) {
  return useQuery({
    queryKey: hrKeys.holiday(id),
    queryFn: () => HRService.getHoliday(id),
    enabled: !!id && id > 0,
  });
}

export function useHolidayCalendar(year: number) {
  return useQuery({
    queryKey: hrKeys.holidayCalendar(year),
    queryFn: () => HRService.getHolidayCalendar(year),
    staleTime: 60000,
    enabled: !!year,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolidayDto) => HRService.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.holidays });
      showSuccess('Tatil günü oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Tatil günü oluşturulamadı');
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHolidayDto }) =>
      HRService.updateHoliday(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.holiday(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.holidays });
      showSuccess('Tatil günü güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Tatil günü güncellenemedi');
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.holidays });
      showSuccess('Tatil günü silindi');
    },
    onError: (error) => {
      showApiError(error, 'Tatil günü silinemedi');
    },
  });
}

// =====================================
// WORK LOCATIONS HOOKS
// =====================================

export function useWorkLocations(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...hrKeys.workLocations, { includeInactive }],
    queryFn: () => HRService.getWorkLocations(includeInactive),
    staleTime: 60000,
  });
}

export function useWorkLocation(id: number) {
  return useQuery({
    queryKey: hrKeys.workLocation(id),
    queryFn: () => HRService.getWorkLocation(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkLocationDto) => HRService.createWorkLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocations });
      showSuccess('Çalışma lokasyonu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma lokasyonu oluşturulamadı');
    },
  });
}

export function useUpdateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkLocationDto }) =>
      HRService.updateWorkLocation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocation(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocations });
      showSuccess('Çalışma lokasyonu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma lokasyonu güncellenemedi');
    },
  });
}

export function useDeleteWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteWorkLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocations });
      showSuccess('Çalışma lokasyonu silindi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma lokasyonu silinemedi');
    },
  });
}

export function useActivateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.activateWorkLocation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocation(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocations });
      showSuccess('Çalışma lokasyonu aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma lokasyonu aktifleştirilemedi');
    },
  });
}

export function useDeactivateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deactivateWorkLocation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocation(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.workLocations });
      showSuccess('Çalışma lokasyonu pasifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışma lokasyonu pasifleştirilemedi');
    },
  });
}

// =====================================
// PAYROLL HOOKS
// =====================================

export function usePayrolls(filter?: PayrollFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.payrollFiltered(filter) : hrKeys.payroll,
    queryFn: () => HRService.getPayrolls(filter),
    staleTime: 30000,
  });
}

export function usePayroll(id: number) {
  return useQuery({
    queryKey: hrKeys.payrollById(id),
    queryFn: () => HRService.getPayroll(id),
    enabled: !!id && id > 0,
  });
}

export function usePayrollSummary(year: number, month: number) {
  return useQuery({
    queryKey: hrKeys.payrollSummary(year, month),
    queryFn: () => HRService.getPayrollSummary(year, month),
    staleTime: 60000,
    enabled: !!year && !!month,
  });
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollDto) => HRService.createPayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Bordro oluşturulamadı');
    },
  });
}

export function useBatchCreatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchCreatePayrollDto) => HRService.batchCreatePayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Toplu bordro oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Toplu bordro oluşturulamadı');
    },
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.calculatePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro hesaplandı');
    },
    onError: (error) => {
      showApiError(error, 'Bordro hesaplanamadı');
    },
  });
}

export function useSubmitPayrollForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.submitPayrollForApproval(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro onaya gönderilemedi');
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApprovePayrollDto }) =>
      HRService.approvePayroll(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Bordro onaylanamadı');
    },
  });
}

export function useRejectPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      HRService.rejectPayroll(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro reddedilemedi');
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: MarkPayrollPaidDto }) =>
      HRService.markPayrollPaid(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'İşlem başarısız');
    },
  });
}

export function useCancelPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      HRService.cancelPayroll(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll });
      showSuccess('Bordro iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro iptal edilemedi');
    },
  });
}

export function useAddPayrollItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payrollId, data }: { payrollId: number; data: AddPayrollItemDto }) =>
      HRService.addPayrollItem(payrollId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.payrollId) });
      showSuccess('Bordro kalemi eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro kalemi eklenemedi');
    },
  });
}

export function useDeletePayrollItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payrollId, itemId }: { payrollId: number; itemId: number }) =>
      HRService.deletePayrollItem(payrollId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payrollById(variables.payrollId) });
      showSuccess('Bordro kalemi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro kalemi silinemedi');
    },
  });
}

// =====================================
// EXPENSES HOOKS
// =====================================

export function useExpenses(filter?: ExpenseFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.expensesFiltered(filter) : hrKeys.expenses,
    queryFn: () => HRService.getExpenses(filter),
    staleTime: 30000,
  });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: hrKeys.expense(id),
    queryFn: () => HRService.getExpense(id),
    enabled: !!id && id > 0,
  });
}

export function useExpenseSummary(employeeId: number, year: number, month: number) {
  return useQuery({
    queryKey: hrKeys.expenseSummary(employeeId, year, month),
    queryFn: () => HRService.getExpenseSummary(employeeId, year, month),
    staleTime: 60000,
    enabled: !!employeeId && !!year && !!month,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => HRService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Masraf oluşturulamadı');
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseDto }) =>
      HRService.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Masraf güncellenemedi');
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf silindi');
    },
    onError: (error) => {
      showApiError(error, 'Masraf silinemedi');
    },
  });
}

export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.submitExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Masraf onaya gönderilemedi');
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveExpenseDto }) =>
      HRService.approveExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Masraf onaylanamadı');
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectExpenseDto }) =>
      HRService.rejectExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Masraf reddedilemedi');
    },
  });
}

export function useMarkExpensePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentReference }: { id: number; paymentReference?: string }) =>
      HRService.markExpensePaid(id, paymentReference),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf ödendi olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'İşlem başarısız');
    },
  });
}

export function useCancelExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.cancelExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.expenses });
      showSuccess('Masraf iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Masraf iptal edilemedi');
    },
  });
}

export function useUploadExpenseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      HRService.uploadExpenseReceipt(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.expense(variables.id) });
      showSuccess('Fiş yüklendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiş yüklenemedi');
    },
  });
}

// =====================================
// PERFORMANCE REVIEWS HOOKS
// =====================================

export function usePerformanceReviews(employeeId?: number, reviewerId?: number, year?: number) {
  return useQuery({
    queryKey: hrKeys.performanceReviewsFiltered(employeeId, reviewerId, year),
    queryFn: () => HRService.getPerformanceReviews(employeeId, reviewerId, year),
    staleTime: 30000,
  });
}

export function usePerformanceReview(id: number) {
  return useQuery({
    queryKey: hrKeys.performanceReview(id),
    queryFn: () => HRService.getPerformanceReview(id),
    enabled: !!id && id > 0,
  });
}

export function useCreatePerformanceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerformanceReviewDto) => HRService.createPerformanceReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReviews });
      showSuccess('Performans değerlendirmesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Performans değerlendirmesi oluşturulamadı');
    },
  });
}

export function useUpdatePerformanceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceReviewDto }) =>
      HRService.updatePerformanceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReviews });
      showSuccess('Performans değerlendirmesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Performans değerlendirmesi güncellenemedi');
    },
  });
}

export function useDeletePerformanceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deletePerformanceReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReviews });
      showSuccess('Performans değerlendirmesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Performans değerlendirmesi silinemedi');
    },
  });
}

export function useCompletePerformanceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteReviewDto }) =>
      HRService.completePerformanceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReviews });
      showSuccess('Performans değerlendirmesi tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Performans değerlendirmesi tamamlanamadı');
    },
  });
}

export function useAcknowledgePerformanceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: AcknowledgeReviewDto }) =>
      HRService.acknowledgePerformanceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceReviews });
      showSuccess('Performans değerlendirmesi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Performans değerlendirmesi onaylanamadı');
    },
  });
}

// =====================================
// PERFORMANCE GOALS HOOKS
// =====================================

export function usePerformanceGoals(employeeId?: number, year?: number) {
  return useQuery({
    queryKey: hrKeys.performanceGoalsFiltered(employeeId, year),
    queryFn: () => HRService.getPerformanceGoals(employeeId, year),
    staleTime: 30000,
  });
}

export function usePerformanceGoal(id: number) {
  return useQuery({
    queryKey: hrKeys.performanceGoal(id),
    queryFn: () => HRService.getPerformanceGoal(id),
    enabled: !!id && id > 0,
  });
}

export function usePerformanceSummary(employeeId: number) {
  return useQuery({
    queryKey: hrKeys.performanceSummary(employeeId),
    queryFn: () => HRService.getPerformanceSummary(employeeId),
    enabled: !!employeeId && employeeId > 0,
    staleTime: 60000,
  });
}

export function useCreatePerformanceGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePerformanceGoalDto) => HRService.createPerformanceGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoals });
      showSuccess('Performans hedefi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Performans hedefi oluşturulamadı');
    },
  });
}

export function useUpdatePerformanceGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePerformanceGoalDto }) =>
      HRService.updatePerformanceGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoal(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoals });
      showSuccess('Performans hedefi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Performans hedefi güncellenemedi');
    },
  });
}

export function useDeletePerformanceGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deletePerformanceGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoals });
      showSuccess('Performans hedefi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Performans hedefi silinemedi');
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGoalProgressDto }) =>
      HRService.updateGoalProgress(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoal(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.performanceGoals });
      showSuccess('Hedef ilerlemesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Hedef ilerlemesi güncellenemedi');
    },
  });
}

// =====================================
// TRAINING HOOKS
// =====================================

export function useTrainings(filter?: TrainingFilterDto) {
  return useQuery({
    queryKey: filter ? hrKeys.trainingsFiltered(filter) : hrKeys.trainings,
    queryFn: () => HRService.getTrainings(filter),
    staleTime: 30000,
  });
}

export function useTraining(id: number) {
  return useQuery({
    queryKey: hrKeys.training(id),
    queryFn: () => HRService.getTraining(id),
    enabled: !!id && id > 0,
  });
}

export function useTrainingSummary() {
  return useQuery({
    queryKey: hrKeys.trainingSummary,
    queryFn: () => HRService.getTrainingSummary(),
    staleTime: 60000,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainingDto) => HRService.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim oluşturulamadı');
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTrainingDto }) =>
      HRService.updateTraining(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.training(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim güncellenemedi');
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim silindi');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim silinemedi');
    },
  });
}

export function useStartTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.startTraining(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.training(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim başlatıldı');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim başlatılamadı');
    },
  });
}

export function useCompleteTrainingProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.completeTrainingProgram(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.training(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim tamamlanamadı');
    },
  });
}

export function useCancelTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.cancelTraining(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.training(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim iptal edilemedi');
    },
  });
}

// =====================================
// EMPLOYEE TRAINING HOOKS
// =====================================

export function useEmployeeTrainings(employeeId?: number, trainingId?: number) {
  return useQuery({
    queryKey: hrKeys.employeeTrainingsFiltered(employeeId, trainingId),
    queryFn: () => HRService.getEmployeeTrainings(employeeId, trainingId),
    staleTime: 30000,
  });
}

export function useEnrollEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trainingId, data }: { trainingId: number; data: EnrollEmployeeDto }) =>
      HRService.enrollEmployee(trainingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.training(variables.trainingId) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeTrainings });
      showSuccess('Çalışan eğitime kaydedildi');
    },
    onError: (error) => {
      showApiError(error, 'Çalışan eğitime kaydedilemedi');
    },
  });
}

export function useCompleteEmployeeTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: number; data: CompleteTrainingDto }) =>
      HRService.completeEmployeeTraining(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeTrainings });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim tamamlanamadı');
    },
  });
}

export function useCancelEmployeeTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, reason }: { enrollmentId: number; reason?: string }) =>
      HRService.cancelEmployeeTraining(enrollmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeTrainings });
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings });
      showSuccess('Eğitim kaydı iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Eğitim kaydı iptal edilemedi');
    },
  });
}

// =====================================
// DOCUMENTS HOOKS
// =====================================

export function useDocuments(employeeId?: number, documentType?: number) {
  return useQuery({
    queryKey: [...hrKeys.documents, { employeeId, documentType }],
    queryFn: () => HRService.getDocuments(employeeId, documentType),
    staleTime: 30000,
  });
}

export function useEmployeeDocuments(employeeId: number) {
  return useQuery({
    queryKey: hrKeys.employeeDocuments(employeeId),
    queryFn: () => HRService.getEmployeeDocuments(employeeId),
    enabled: !!employeeId && employeeId > 0,
    staleTime: 30000,
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: hrKeys.document(id),
    queryFn: () => HRService.getDocument(id),
    enabled: !!id && id > 0,
  });
}

export function useExpiringDocuments(days: number = 30) {
  return useQuery({
    queryKey: hrKeys.expiringDocuments(days),
    queryFn: () => HRService.getExpiringDocuments(days),
    staleTime: 60000,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDocumentDto) => HRService.createDocument(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeDocuments(variables.employeeId) });
      queryClient.invalidateQueries({ queryKey: hrKeys.documents });
      showSuccess('Belge oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Belge oluşturulamadı');
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDocumentDto }) =>
      HRService.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.document(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.documents });
      showSuccess('Belge güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Belge güncellenemedi');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.documents });
      showSuccess('Belge silindi');
    },
    onError: (error) => {
      showApiError(error, 'Belge silinemedi');
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: VerifyDocumentDto }) =>
      HRService.verifyDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.document(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.documents });
      showSuccess('Belge doğrulandı');
    },
    onError: (error) => {
      showApiError(error, 'Belge doğrulanamadı');
    },
  });
}

export function useUploadDocumentFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      HRService.uploadDocumentFile(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.document(variables.id) });
      showSuccess('Dosya yüklendi');
    },
    onError: (error) => {
      showApiError(error, 'Dosya yüklenemedi');
    },
  });
}

// =====================================
// ANNOUNCEMENTS HOOKS
// =====================================

export function useAnnouncements(departmentId?: number, includeExpired?: boolean) {
  return useQuery({
    queryKey: [...hrKeys.announcements, { departmentId, includeExpired }],
    queryFn: () => HRService.getAnnouncements(departmentId, includeExpired),
    staleTime: 30000,
  });
}

export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: hrKeys.announcement(id),
    queryFn: () => HRService.getAnnouncement(id),
    enabled: !!id && id > 0,
  });
}

export function useAnnouncementStatistics(id: number) {
  return useQuery({
    queryKey: hrKeys.announcementStatistics(id),
    queryFn: () => HRService.getAnnouncementStatistics(id),
    enabled: !!id && id > 0,
    staleTime: 60000,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementDto) => HRService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Duyuru oluşturulamadı');
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementDto }) =>
      HRService.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcement(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Duyuru güncellenemedi');
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru silindi');
    },
    onError: (error) => {
      showApiError(error, 'Duyuru silinemedi');
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.publishAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcement(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru yayınlandı');
    },
    onError: (error) => {
      showApiError(error, 'Duyuru yayınlanamadı');
    },
  });
}

export function useUnpublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.unpublishAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcement(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru yayından kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'Duyuru yayından kaldırılamadı');
    },
  });
}

export function useAcknowledgeAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: AcknowledgeAnnouncementDto }) =>
      HRService.acknowledgeAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.announcement(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.announcements });
      showSuccess('Duyuru okundu olarak işaretlendi');
    },
    onError: (error) => {
      showApiError(error, 'İşlem başarısız');
    },
  });
}
