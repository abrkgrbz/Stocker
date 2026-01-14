/**
 * React Query Hooks for HR Module
 * Comprehensive hooks for all HR endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HRService } from '../services/hr.service';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { queryOptions } from '../query-options';
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
  // Career Path
  CareerPathDto,
  CreateCareerPathDto,
  UpdateCareerPathDto,
  // Certification
  CertificationDto,
  CreateCertificationDto,
  UpdateCertificationDto,
  // Disciplinary Action
  DisciplinaryActionDto,
  CreateDisciplinaryActionDto,
  UpdateDisciplinaryActionDto,
  // Employee Asset
  EmployeeAssetDto,
  CreateEmployeeAssetDto,
  UpdateEmployeeAssetDto,
  // Employee Benefit
  EmployeeBenefitDto,
  CreateEmployeeBenefitDto,
  UpdateEmployeeBenefitDto,
  // Onboarding
  OnboardingDto,
  CreateOnboardingDto,
  UpdateOnboardingDto,
  // Payslip
  PayslipDto,
  CreatePayslipDto,
  // Overtime
  OvertimeDto,
  CreateOvertimeDto,
  UpdateOvertimeDto,
  // TimeSheet
  TimeSheetDto,
  CreateTimeSheetDto,
  UpdateTimeSheetDto,
  // Succession Plan
  SuccessionPlanDto,
  CreateSuccessionPlanDto,
  UpdateSuccessionPlanDto,
  // Employee Skill
  EmployeeSkillDto,
  CreateEmployeeSkillDto,
  UpdateEmployeeSkillDto,
  // Grievance
  GrievanceDto,
  CreateGrievanceDto,
  UpdateGrievanceDto,
  // Interview
  InterviewDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  // Job Application
  JobApplicationDto,
  CreateJobApplicationDto,
  UpdateJobApplicationDto,
  // Job Posting
  JobPostingDto,
  CreateJobPostingDto,
  UpdateJobPostingDto,
  // Tree and Summary types
  DepartmentTreeDto,
  DailyAttendanceSummaryDto,
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

  // Career Paths
  careerPaths: ['hr', 'career-paths'] as const,
  careerPath: (id: number) => ['hr', 'career-paths', id] as const,

  // Certifications
  certifications: ['hr', 'certifications'] as const,
  certification: (id: number) => ['hr', 'certifications', id] as const,

  // Disciplinary Actions
  disciplinaryActions: ['hr', 'disciplinary-actions'] as const,
  disciplinaryAction: (id: number) => ['hr', 'disciplinary-actions', id] as const,
  disciplinaryActionsFiltered: (employeeId?: number) =>
    ['hr', 'disciplinary-actions', 'filtered', { employeeId }] as const,

  // Employee Assets
  employeeAssets: ['hr', 'employee-assets'] as const,
  employeeAsset: (id: number) => ['hr', 'employee-assets', id] as const,
  employeeAssetsFiltered: (employeeId?: number) =>
    ['hr', 'employee-assets', 'filtered', { employeeId }] as const,

  // Employee Benefits
  employeeBenefits: ['hr', 'employee-benefits'] as const,
  employeeBenefit: (id: number) => ['hr', 'employee-benefits', id] as const,
  employeeBenefitsFiltered: (employeeId?: number) =>
    ['hr', 'employee-benefits', 'filtered', { employeeId }] as const,

  // Onboarding
  onboardings: ['hr', 'onboarding'] as const,
  onboarding: (id: number) => ['hr', 'onboarding', id] as const,
  onboardingsFiltered: (employeeId?: number) =>
    ['hr', 'onboarding', 'filtered', { employeeId }] as const,

  // Payslips
  payslips: ['hr', 'payslips'] as const,
  payslip: (id: number) => ['hr', 'payslips', id] as const,
  payslipsFiltered: (employeeId?: number, year?: number, month?: number) =>
    ['hr', 'payslips', 'filtered', { employeeId, year, month }] as const,

  // Overtimes
  overtimes: ['hr', 'overtimes'] as const,
  overtime: (id: number) => ['hr', 'overtimes', id] as const,
  overtimesFiltered: (employeeId?: number, startDate?: string, endDate?: string) =>
    ['hr', 'overtimes', 'filtered', { employeeId, startDate, endDate }] as const,

  // TimeSheets
  timeSheets: ['hr', 'timesheets'] as const,
  timeSheet: (id: number) => ['hr', 'timesheets', id] as const,
  timeSheetsFiltered: (employeeId?: number, startDate?: string, endDate?: string) =>
    ['hr', 'timesheets', 'filtered', { employeeId, startDate, endDate }] as const,

  // Succession Plans
  successionPlans: ['hr', 'succession-plans'] as const,
  successionPlan: (id: number) => ['hr', 'succession-plans', id] as const,

  // Employee Skills
  employeeSkills: ['hr', 'employee-skills'] as const,
  employeeSkill: (id: number) => ['hr', 'employee-skills', id] as const,
  employeeSkillsFiltered: (employeeId?: number) =>
    ['hr', 'employee-skills', 'filtered', { employeeId }] as const,

  // Grievances
  grievances: ['hr', 'grievances'] as const,
  grievance: (id: number) => ['hr', 'grievances', id] as const,
  grievancesFiltered: (employeeId?: number, status?: string) =>
    ['hr', 'grievances', 'filtered', { employeeId, status }] as const,

  // Interviews
  interviews: ['hr', 'interviews'] as const,
  interview: (id: number) => ['hr', 'interviews', id] as const,
  interviewsFiltered: (applicationId?: number, interviewerId?: number) =>
    ['hr', 'interviews', 'filtered', { applicationId, interviewerId }] as const,

  // Job Applications
  jobApplications: ['hr', 'job-applications'] as const,
  jobApplication: (id: number) => ['hr', 'job-applications', id] as const,
  jobApplicationsFiltered: (jobPostingId?: number, status?: string) =>
    ['hr', 'job-applications', 'filtered', { jobPostingId, status }] as const,

  // Job Postings
  jobPostings: ['hr', 'job-postings'] as const,
  jobPosting: (id: number) => ['hr', 'job-postings', id] as const,
};

// =====================================
// EMPLOYEES HOOKS
// =====================================

export function useEmployees(filter?: EmployeeFilterDto) {
  return useQuery<EmployeeSummaryDto[]>({
    queryKey: filter ? hrKeys.employeesFiltered(filter) : hrKeys.employees,
    queryFn: () => HRService.getEmployees(filter),
    ...queryOptions.list(),
  });
}

export function useEmployee(id: number) {
  return useQuery<EmployeeDto>({
    queryKey: hrKeys.employee(id),
    queryFn: () => HRService.getEmployee(id),
    ...queryOptions.detail({ enabled: !!id && id > 0 }),
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
  return useQuery<DepartmentDto[]>({
    queryKey: [...hrKeys.departments, { includeInactive }],
    queryFn: () => HRService.getDepartments(includeInactive),
    ...queryOptions.static(),
  });
}

export function useDepartment(id: number) {
  return useQuery<DepartmentDto>({
    queryKey: hrKeys.department(id),
    queryFn: () => HRService.getDepartment(id),
    ...queryOptions.detail({ enabled: !!id && id > 0 }),
  });
}

export function useDepartmentTree() {
  return useQuery<DepartmentTreeDto[]>({
    queryKey: hrKeys.departmentTree,
    queryFn: () => HRService.getDepartmentTree(),
    ...queryOptions.static(),
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
  return useQuery<AttendanceDto[]>({
    queryKey: filter ? hrKeys.attendanceFiltered(filter) : hrKeys.attendance,
    queryFn: () => HRService.getAttendance(filter),
    staleTime: 30000,
  });
}

export function useAttendanceById(id: number) {
  return useQuery<AttendanceDto>({
    queryKey: hrKeys.attendanceById(id),
    queryFn: () => HRService.getAttendanceById(id),
    enabled: !!id && id > 0,
  });
}

export function useDailyAttendance(date: string, departmentId?: number) {
  return useQuery<DailyAttendanceSummaryDto>({
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

// =====================================
// CAREER PATHS HOOKS
// =====================================

export function useCareerPaths() {
  return useQuery({
    queryKey: hrKeys.careerPaths,
    queryFn: () => HRService.getCareerPaths(),
    staleTime: 60000,
  });
}

export function useCareerPath(id: number) {
  return useQuery({
    queryKey: hrKeys.careerPath(id),
    queryFn: () => HRService.getCareerPath(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateCareerPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCareerPathDto) => HRService.createCareerPath(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.careerPaths });
      showSuccess('Kariyer yolu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Kariyer yolu oluşturulamadı');
    },
  });
}

export function useUpdateCareerPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCareerPathDto }) =>
      HRService.updateCareerPath(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.careerPath(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.careerPaths });
      showSuccess('Kariyer yolu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kariyer yolu güncellenemedi');
    },
  });
}

export function useDeleteCareerPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteCareerPath(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.careerPaths });
      showSuccess('Kariyer yolu silindi');
    },
    onError: (error) => {
      showApiError(error, 'Kariyer yolu silinemedi');
    },
  });
}

// =====================================
// CERTIFICATIONS HOOKS
// =====================================

export function useCertifications() {
  return useQuery({
    queryKey: hrKeys.certifications,
    queryFn: () => HRService.getCertifications(),
    staleTime: 60000,
  });
}

export function useCertification(id: number) {
  return useQuery({
    queryKey: hrKeys.certification(id),
    queryFn: () => HRService.getCertification(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCertificationDto) => HRService.createCertification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.certifications });
      showSuccess('Sertifika oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Sertifika oluşturulamadı');
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCertificationDto }) =>
      HRService.updateCertification(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.certification(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.certifications });
      showSuccess('Sertifika güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Sertifika güncellenemedi');
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteCertification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.certifications });
      showSuccess('Sertifika silindi');
    },
    onError: (error) => {
      showApiError(error, 'Sertifika silinemedi');
    },
  });
}

// =====================================
// DISCIPLINARY ACTIONS HOOKS
// =====================================

export function useDisciplinaryActions(employeeId?: number) {
  return useQuery({
    queryKey: employeeId ? hrKeys.disciplinaryActionsFiltered(employeeId) : hrKeys.disciplinaryActions,
    queryFn: () => HRService.getDisciplinaryActions(employeeId),
    staleTime: 30000,
  });
}

export function useDisciplinaryAction(id: number) {
  return useQuery({
    queryKey: hrKeys.disciplinaryAction(id),
    queryFn: () => HRService.getDisciplinaryAction(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisciplinaryActionDto) => HRService.createDisciplinaryAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.disciplinaryActions });
      showSuccess('Disiplin işlemi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Disiplin işlemi oluşturulamadı');
    },
  });
}

export function useUpdateDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDisciplinaryActionDto }) =>
      HRService.updateDisciplinaryAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.disciplinaryAction(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.disciplinaryActions });
      showSuccess('Disiplin işlemi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Disiplin işlemi güncellenemedi');
    },
  });
}

export function useDeleteDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteDisciplinaryAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.disciplinaryActions });
      showSuccess('Disiplin işlemi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Disiplin işlemi silinemedi');
    },
  });
}

// =====================================
// EMPLOYEE ASSETS HOOKS
// =====================================

export function useEmployeeAssets(employeeId?: number) {
  return useQuery({
    queryKey: employeeId ? hrKeys.employeeAssetsFiltered(employeeId) : hrKeys.employeeAssets,
    queryFn: () => HRService.getEmployeeAssets(employeeId),
    staleTime: 30000,
  });
}

export function useEmployeeAsset(id: number) {
  return useQuery({
    queryKey: hrKeys.employeeAsset(id),
    queryFn: () => HRService.getEmployeeAsset(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateEmployeeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeAssetDto) => HRService.createEmployeeAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAssets });
      showSuccess('Zimmet oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Zimmet oluşturulamadı');
    },
  });
}

export function useUpdateEmployeeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeAssetDto }) =>
      HRService.updateEmployeeAsset(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAsset(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAssets });
      showSuccess('Zimmet güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Zimmet güncellenemedi');
    },
  });
}

export function useDeleteEmployeeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteEmployeeAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAssets });
      showSuccess('Zimmet silindi');
    },
    onError: (error) => {
      showApiError(error, 'Zimmet silinemedi');
    },
  });
}

export function useReturnEmployeeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.returnEmployeeAsset(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAsset(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeAssets });
      showSuccess('Zimmet iade edildi');
    },
    onError: (error) => {
      showApiError(error, 'Zimmet iade edilemedi');
    },
  });
}

// =====================================
// EMPLOYEE BENEFITS HOOKS
// =====================================

export function useEmployeeBenefits(employeeId?: number) {
  return useQuery({
    queryKey: employeeId ? hrKeys.employeeBenefitsFiltered(employeeId) : hrKeys.employeeBenefits,
    queryFn: () => HRService.getEmployeeBenefits(employeeId),
    staleTime: 30000,
  });
}

export function useEmployeeBenefit(id: number) {
  return useQuery({
    queryKey: hrKeys.employeeBenefit(id),
    queryFn: () => HRService.getEmployeeBenefit(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateEmployeeBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeBenefitDto) => HRService.createEmployeeBenefit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeBenefits });
      showSuccess('Yan hak oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Yan hak oluşturulamadı');
    },
  });
}

export function useUpdateEmployeeBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeBenefitDto }) =>
      HRService.updateEmployeeBenefit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeBenefit(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeBenefits });
      showSuccess('Yan hak güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Yan hak güncellenemedi');
    },
  });
}

export function useDeleteEmployeeBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteEmployeeBenefit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeBenefits });
      showSuccess('Yan hak silindi');
    },
    onError: (error) => {
      showApiError(error, 'Yan hak silinemedi');
    },
  });
}

// =====================================
// ONBOARDING HOOKS
// =====================================

export function useOnboardings(employeeId?: number) {
  return useQuery({
    queryKey: employeeId ? hrKeys.onboardingsFiltered(employeeId) : hrKeys.onboardings,
    queryFn: () => HRService.getOnboardings(employeeId),
    staleTime: 30000,
  });
}

export function useOnboarding(id: number) {
  return useQuery({
    queryKey: hrKeys.onboarding(id),
    queryFn: () => HRService.getOnboarding(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOnboardingDto) => HRService.createOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboardings });
      showSuccess('İşe alım süreci oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İşe alım süreci oluşturulamadı');
    },
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOnboardingDto }) =>
      HRService.updateOnboarding(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboarding(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.onboardings });
      showSuccess('İşe alım süreci güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İşe alım süreci güncellenemedi');
    },
  });
}

export function useDeleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboardings });
      showSuccess('İşe alım süreci silindi');
    },
    onError: (error) => {
      showApiError(error, 'İşe alım süreci silinemedi');
    },
  });
}

export function useStartOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.startOnboarding(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboarding(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.onboardings });
      showSuccess('İşe alım süreci başlatıldı');
    },
    onError: (error) => {
      showApiError(error, 'İşe alım süreci başlatılamadı');
    },
  });
}

export function useCompleteOnboardingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskId }: { id: number; taskId: number }) =>
      HRService.completeOnboardingTask(id, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboarding(variables.id) });
      showSuccess('Görev tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Görev tamamlanamadı');
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.completeOnboarding(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.onboarding(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.onboardings });
      showSuccess('İşe alım süreci tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'İşe alım süreci tamamlanamadı');
    },
  });
}

// =====================================
// PAYSLIPS HOOKS
// =====================================

export function usePayslips(employeeId?: number, year?: number, month?: number) {
  return useQuery({
    queryKey: hrKeys.payslipsFiltered(employeeId, year, month),
    queryFn: () => HRService.getPayslips(employeeId, year, month),
    staleTime: 30000,
  });
}

export function usePayslip(id: number) {
  return useQuery({
    queryKey: hrKeys.payslip(id),
    queryFn: () => HRService.getPayslip(id),
    enabled: !!id && id > 0,
  });
}

export function useCreatePayslip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayslipDto) => HRService.createPayslip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payslips });
      showSuccess('Bordro belgesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Bordro belgesi oluşturulamadı');
    },
  });
}

export function useDeletePayslip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deletePayslip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payslips });
      showSuccess('Bordro belgesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro belgesi silinemedi');
    },
  });
}

export function useSendPayslip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.sendPayslip(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payslip(id) });
      showSuccess('Bordro belgesi gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Bordro belgesi gönderilemedi');
    },
  });
}

export function useDownloadPayslip() {
  return useMutation({
    mutationFn: (id: number) => HRService.downloadPayslip(id),
    onError: (error) => {
      showApiError(error, 'Bordro belgesi indirilemedi');
    },
  });
}

// =====================================
// OVERTIMES HOOKS
// =====================================

export function useOvertimes(employeeId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: hrKeys.overtimesFiltered(employeeId, startDate, endDate),
    queryFn: () => HRService.getOvertimes(employeeId, startDate, endDate),
    staleTime: 30000,
  });
}

export function useOvertime(id: number) {
  return useQuery({
    queryKey: hrKeys.overtime(id),
    queryFn: () => HRService.getOvertime(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOvertimeDto) => HRService.createOvertime(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.overtimes });
      showSuccess('Fazla mesai talebi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fazla mesai talebi oluşturulamadı');
    },
  });
}

export function useUpdateOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOvertimeDto }) =>
      HRService.updateOvertime(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.overtime(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.overtimes });
      showSuccess('Fazla mesai talebi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Fazla mesai talebi güncellenemedi');
    },
  });
}

export function useDeleteOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteOvertime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.overtimes });
      showSuccess('Fazla mesai talebi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Fazla mesai talebi silinemedi');
    },
  });
}

export function useApproveOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      HRService.approveOvertime(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.overtime(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.overtimes });
      showSuccess('Fazla mesai talebi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Fazla mesai talebi onaylanamadı');
    },
  });
}

export function useRejectOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      HRService.rejectOvertime(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.overtime(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.overtimes });
      showSuccess('Fazla mesai talebi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Fazla mesai talebi reddedilemedi');
    },
  });
}

// =====================================
// TIMESHEETS HOOKS
// =====================================

export function useTimeSheets(employeeId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: hrKeys.timeSheetsFiltered(employeeId, startDate, endDate),
    queryFn: () => HRService.getTimeSheets(employeeId, startDate, endDate),
    staleTime: 30000,
  });
}

export function useTimeSheet(id: number) {
  return useQuery({
    queryKey: hrKeys.timeSheet(id),
    queryFn: () => HRService.getTimeSheet(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeSheetDto) => HRService.createTimeSheet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi oluşturulamadı');
    },
  });
}

export function useUpdateTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimeSheetDto }) =>
      HRService.updateTimeSheet(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheet(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi güncellenemedi');
    },
  });
}

export function useDeleteTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteTimeSheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi silindi');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi silinemedi');
    },
  });
}

export function useSubmitTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.submitTimeSheet(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheet(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi onaya gönderildi');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi onaya gönderilemedi');
    },
  });
}

export function useApproveTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      HRService.approveTimeSheet(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheet(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi onaylandı');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi onaylanamadı');
    },
  });
}

export function useRejectTimeSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      HRService.rejectTimeSheet(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheet(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.timeSheets });
      showSuccess('Zaman çizelgesi reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Zaman çizelgesi reddedilemedi');
    },
  });
}

// =====================================
// SUCCESSION PLANS HOOKS
// =====================================

export function useSuccessionPlans() {
  return useQuery({
    queryKey: hrKeys.successionPlans,
    queryFn: () => HRService.getSuccessionPlans(),
    staleTime: 60000,
  });
}

export function useSuccessionPlan(id: number) {
  return useQuery({
    queryKey: hrKeys.successionPlan(id),
    queryFn: () => HRService.getSuccessionPlan(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateSuccessionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSuccessionPlanDto) => HRService.createSuccessionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.successionPlans });
      showSuccess('Yedekleme planı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Yedekleme planı oluşturulamadı');
    },
  });
}

export function useUpdateSuccessionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSuccessionPlanDto }) =>
      HRService.updateSuccessionPlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.successionPlan(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.successionPlans });
      showSuccess('Yedekleme planı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Yedekleme planı güncellenemedi');
    },
  });
}

export function useDeleteSuccessionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteSuccessionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.successionPlans });
      showSuccess('Yedekleme planı silindi');
    },
    onError: (error) => {
      showApiError(error, 'Yedekleme planı silinemedi');
    },
  });
}

// =====================================
// EMPLOYEE SKILLS HOOKS
// =====================================

export function useEmployeeSkills(employeeId?: number) {
  return useQuery({
    queryKey: employeeId ? hrKeys.employeeSkillsFiltered(employeeId) : hrKeys.employeeSkills,
    queryFn: () => HRService.getEmployeeSkills(employeeId),
    staleTime: 30000,
  });
}

export function useEmployeeSkill(id: number) {
  return useQuery({
    queryKey: hrKeys.employeeSkill(id),
    queryFn: () => HRService.getEmployeeSkill(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeSkillDto) => HRService.createEmployeeSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeSkills });
      showSuccess('Yetkinlik oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Yetkinlik oluşturulamadı');
    },
  });
}

export function useUpdateEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeSkillDto }) =>
      HRService.updateEmployeeSkill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeSkill(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeSkills });
      showSuccess('Yetkinlik güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Yetkinlik güncellenemedi');
    },
  });
}

export function useDeleteEmployeeSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteEmployeeSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employeeSkills });
      showSuccess('Yetkinlik silindi');
    },
    onError: (error) => {
      showApiError(error, 'Yetkinlik silinemedi');
    },
  });
}

// =====================================
// GRIEVANCES HOOKS
// =====================================

export function useGrievances(employeeId?: number, status?: string) {
  return useQuery({
    queryKey: hrKeys.grievancesFiltered(employeeId, status),
    queryFn: () => HRService.getGrievances(employeeId, status),
    staleTime: 30000,
  });
}

export function useGrievance(id: number) {
  return useQuery({
    queryKey: hrKeys.grievance(id),
    queryFn: () => HRService.getGrievance(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGrievanceDto) => HRService.createGrievance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.grievances });
      showSuccess('Şikayet oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Şikayet oluşturulamadı');
    },
  });
}

export function useUpdateGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGrievanceDto }) =>
      HRService.updateGrievance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.grievance(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.grievances });
      showSuccess('Şikayet güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Şikayet güncellenemedi');
    },
  });
}

export function useDeleteGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteGrievance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.grievances });
      showSuccess('Şikayet silindi');
    },
    onError: (error) => {
      showApiError(error, 'Şikayet silinemedi');
    },
  });
}

export function useResolveGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution: string }) =>
      HRService.resolveGrievance(id, resolution),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.grievance(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.grievances });
      showSuccess('Şikayet çözüldü');
    },
    onError: (error) => {
      showApiError(error, 'Şikayet çözülemedi');
    },
  });
}

export function useEscalateGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      HRService.escalateGrievance(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.grievance(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.grievances });
      showSuccess('Şikayet üst seviyeye iletildi');
    },
    onError: (error) => {
      showApiError(error, 'Şikayet iletilemedi');
    },
  });
}

// =====================================
// INTERVIEWS HOOKS
// =====================================

export function useInterviews(applicationId?: number, interviewerId?: number) {
  return useQuery({
    queryKey: hrKeys.interviewsFiltered(applicationId, interviewerId),
    queryFn: () => HRService.getInterviews(applicationId, interviewerId),
    staleTime: 30000,
  });
}

export function useInterview(id: number) {
  return useQuery({
    queryKey: hrKeys.interview(id),
    queryFn: () => HRService.getInterview(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewDto) => HRService.createInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat oluşturulamadı');
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInterviewDto }) =>
      HRService.updateInterview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat güncellenemedi');
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat silindi');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat silinemedi');
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: number; scheduledAt: string }) =>
      HRService.scheduleInterview(id, scheduledAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat planlandı');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat planlanamadı');
    },
  });
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, feedback, rating }: { id: number; feedback: string; rating?: number }) =>
      HRService.completeInterview(id, feedback, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat tamamlandı');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat tamamlanamadı');
    },
  });
}

export function useCancelInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      HRService.cancelInterview(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.interview(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.interviews });
      showSuccess('Mülakat iptal edildi');
    },
    onError: (error) => {
      showApiError(error, 'Mülakat iptal edilemedi');
    },
  });
}

// =====================================
// JOB APPLICATIONS HOOKS
// =====================================

export function useJobApplications(jobPostingId?: number, status?: string) {
  return useQuery({
    queryKey: hrKeys.jobApplicationsFiltered(jobPostingId, status),
    queryFn: () => HRService.getJobApplications(jobPostingId, status),
    staleTime: 30000,
  });
}

export function useJobApplication(id: number) {
  return useQuery({
    queryKey: hrKeys.jobApplication(id),
    queryFn: () => HRService.getJobApplication(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobApplicationDto) => HRService.createJobApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      showSuccess('İş başvurusu oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İş başvurusu oluşturulamadı');
    },
  });
}

export function useUpdateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJobApplicationDto }) =>
      HRService.updateJobApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplication(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      showSuccess('İş başvurusu güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İş başvurusu güncellenemedi');
    },
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteJobApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      showSuccess('İş başvurusu silindi');
    },
    onError: (error) => {
      showApiError(error, 'İş başvurusu silinemedi');
    },
  });
}

export function useMoveToNextStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      HRService.moveToNextStage(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplication(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      showSuccess('Başvuru sonraki aşamaya geçirildi');
    },
    onError: (error) => {
      showApiError(error, 'Başvuru ilerletilemedi');
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      HRService.rejectApplication(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplication(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      showSuccess('Başvuru reddedildi');
    },
    onError: (error) => {
      showApiError(error, 'Başvuru reddedilemedi');
    },
  });
}

export function useHireApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, startDate, positionId }: { id: number; startDate: string; positionId: number }) =>
      HRService.hireApplicant(id, startDate, positionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplication(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobApplications });
      queryClient.invalidateQueries({ queryKey: hrKeys.employees });
      showSuccess('Aday işe alındı');
    },
    onError: (error) => {
      showApiError(error, 'Aday işe alınamadı');
    },
  });
}

// =====================================
// JOB POSTINGS HOOKS
// =====================================

export function useJobPostings() {
  return useQuery({
    queryKey: hrKeys.jobPostings,
    queryFn: () => HRService.getJobPostings(),
    staleTime: 30000,
  });
}

export function useJobPosting(id: number) {
  return useQuery({
    queryKey: hrKeys.jobPosting(id),
    queryFn: () => HRService.getJobPosting(id),
    enabled: !!id && id > 0,
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobPostingDto) => HRService.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı oluşturulamadı');
    },
  });
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJobPostingDto }) =>
      HRService.updateJobPosting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPosting(variables.id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı güncellenemedi');
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.deleteJobPosting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı silindi');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı silinemedi');
    },
  });
}

export function usePublishJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.publishJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPosting(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı yayınlandı');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı yayınlanamadı');
    },
  });
}

export function useUnpublishJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.unpublishJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPosting(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı yayından kaldırıldı');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı yayından kaldırılamadı');
    },
  });
}

export function useCloseJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => HRService.closeJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPosting(id) });
      queryClient.invalidateQueries({ queryKey: hrKeys.jobPostings });
      showSuccess('İş ilanı kapatıldı');
    },
    onError: (error) => {
      showApiError(error, 'İş ilanı kapatılamadı');
    },
  });
}

// =====================================
// PAYROLL PARAMETERS (Turkish Compliance)
// =====================================

export function usePayrollParameters() {
  return useQuery({
    queryKey: ['hr', 'payroll', 'parameters'] as const,
    queryFn: () => HRService.getPayrollParameters(),
    ...queryOptions,
  });
}
