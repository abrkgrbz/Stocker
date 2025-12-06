/**
 * HR Module Type Definitions
 * Based on Stocker.Modules.HR backend DTOs and Enums
 */

// =====================================
// ENUMS
// =====================================

export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3,
  PreferNotToSay = 4,
}

export enum EmployeeStatus {
  Active = 1,
  Inactive = 2,
  OnLeave = 3,
  Terminated = 4,
  Resigned = 5,
  Retired = 6,
  Probation = 7,
  MilitaryService = 8,
  MaternityLeave = 9,
  SickLeave = 10,
}

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2,
  Contract = 3,
  Intern = 4,
  Temporary = 5,
  Consultant = 6,
  Freelance = 7,
  Probation = 8,
}

export enum PayrollPeriod {
  Weekly = 1,
  BiWeekly = 2,
  Monthly = 3,
  Quarterly = 4,
  Annually = 5,
}

export enum LeaveStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Taken = 5,
  PartiallyTaken = 6,
}

export enum AttendanceStatus {
  Present = 1,
  Absent = 2,
  Late = 3,
  EarlyDeparture = 4,
  OnLeave = 5,
  Holiday = 6,
  Weekend = 7,
  RemoteWork = 8,
  HalfDay = 9,
  Overtime = 10,
  Training = 11,
  FieldWork = 12,
}

export enum PayrollStatus {
  Draft = 1,
  Calculated = 2,
  PendingApproval = 3,
  Approved = 4,
  Paid = 5,
  Cancelled = 6,
  Rejected = 7,
}

export enum ExpenseType {
  Transportation = 1,
  Meal = 2,
  Accommodation = 3,
  Communication = 4,
  OfficeSupplies = 5,
  Training = 6,
  Medical = 7,
  Entertainment = 8,
  Other = 99,
}

export enum ExpenseStatus {
  Draft = 1,
  Pending = 2,
  Approved = 3,
  Rejected = 4,
  Paid = 5,
  Cancelled = 6,
}

export enum DocumentType {
  IdentityCard = 1,
  Passport = 2,
  DrivingLicense = 3,
  Diploma = 4,
  Certificate = 5,
  Resume = 6,
  EmploymentContract = 7,
  MedicalReport = 8,
  CriminalRecord = 9,
  AddressProof = 10,
  ReferenceLetter = 11,
  SocialSecurityDocument = 12,
  BankInformation = 13,
  FamilyRegister = 14,
  MilitaryDocument = 15,
  Photo = 16,
  Other = 99,
}

export enum TrainingStatus {
  Scheduled = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  Postponed = 5,
}

export enum EmployeeTrainingStatus {
  Enrolled = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
}

export enum PerformanceRating {
  Unsatisfactory = 1,
  NeedsImprovement = 2,
  MeetsExpectations = 3,
  ExceedsExpectations = 4,
  Outstanding = 5,
}

export enum ShiftType {
  Morning = 1,
  Afternoon = 2,
  Evening = 3,
  Night = 4,
  FullDay = 5,
  Flexible = 6,
  Rotating = 7,
  OnCall = 8,
}

// =====================================
// EMPLOYEE DTOs
// =====================================

export interface EmployeeDto {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  middleName?: string;
  nationalId?: string;
  birthDate?: string;
  age?: number;
  gender?: Gender;
  maritalStatus?: string;
  nationality?: string;
  photoUrl?: string;
  // Contact Information
  email?: string;
  personalEmail?: string;
  phone?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Job Information
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionTitle?: string;
  managerId?: number;
  managerName?: string;
  shiftId?: number;
  shiftName?: string;
  workLocationId?: number;
  workLocationName?: string;
  hireDate: string;
  probationEndDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  yearsOfService: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  // Salary Information
  baseSalary?: number;
  currency?: string;
  payrollPeriod?: PayrollPeriod;
  // Bank Information
  bankName?: string;
  iban?: string;
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeeSummaryDto {
  id: number;
  employeeCode: string;
  fullName: string;
  photoUrl?: string;
  email?: string;
  departmentName?: string;
  positionTitle?: string;
  status: EmployeeStatus;
  hireDate: string;
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: Gender;
  email: string;
  phone: string;
  // Optional Personal Info
  middleName?: string;
  birthPlace?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodType?: string;
  // Optional Contact Information
  personalEmail?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Required Job Information
  departmentId: number;
  positionId: number;
  hireDate: string;
  employmentType: EmploymentType;
  baseSalary: number;
  // Optional Job Information
  managerId?: number;
  shiftId?: number;
  workLocationId?: number;
  probationEndDate?: string;
  // Salary Information
  currency?: string;
  payrollPeriod?: PayrollPeriod;
  // Bank Information
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  iban?: string;
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // Tax Information
  socialSecurityNumber?: string;
  taxNumber?: string;
  taxOffice?: string;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  email: string;
  phone: string;
  // Personal Info (Optional)
  middleName?: string;
  birthPlace?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodType?: string;
  // Contact Information (Optional)
  personalEmail?: string;
  mobilePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Job Information (Required)
  departmentId: number;
  positionId: number;
  employmentType: EmploymentType;
  // Job Information (Optional)
  managerId?: number;
  shiftId?: number;
  workLocationId?: number;
  probationEndDate?: string;
  // Salary Information
  baseSalary: number;
  currency?: string;
  payrollPeriod?: PayrollPeriod;
  // Bank Information
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  iban?: string;
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // Tax Information
  socialSecurityNumber?: string;
  taxNumber?: string;
  taxOffice?: string;
}

export interface TerminateEmployeeDto {
  terminationDate: string;
  terminationReason?: string;
}

export interface EmployeeOrgChartDto {
  id: number;
  fullName: string;
  photoUrl?: string;
  positionTitle?: string;
  departmentName?: string;
  subordinates: EmployeeOrgChartDto[];
}

// =====================================
// DEPARTMENT DTOs
// =====================================

export interface DepartmentDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: number;
  parentDepartmentName?: string;
  managerId?: number;
  managerName?: string;
  costCenter?: string;
  location?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  employeeCount: number;
  subDepartments: DepartmentDto[];
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: number;
  managerId?: number;
  costCenter?: string;
  location?: string;
  displayOrder: number;
}

export interface UpdateDepartmentDto {
  name: string;
  description?: string;
  parentDepartmentId?: number;
  managerId?: number;
  costCenter?: string;
  location?: string;
  displayOrder: number;
}

export interface DepartmentTreeDto {
  id: number;
  code: string;
  name: string;
  level: number;
  hasChildren: boolean;
  employeeCount: number;
  children: DepartmentTreeDto[];
}

// =====================================
// POSITION DTOs
// =====================================

export interface PositionDto {
  id: number;
  code: string;
  title: string;
  description?: string;
  departmentId: number;
  departmentName?: string;
  level: number;
  minSalary: number;
  maxSalary: number;
  currency: string;
  headCount?: number;
  filledPositions: number;
  vacancies: number;
  requirements?: string;
  responsibilities?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PositionSummaryDto {
  id: number;
  code: string;
  title: string;
  departmentName?: string;
  level: number;
  headCount?: number;
  filledPositions: number;
  isActive: boolean;
}

export interface CreatePositionDto {
  code: string;
  title: string;
  description?: string;
  departmentId: number;
  level: number;
  minSalary: number;
  maxSalary: number;
  currency?: string;
  headCount?: number;
  requirements?: string;
  responsibilities?: string;
}

export interface UpdatePositionDto {
  title: string;
  description?: string;
  departmentId: number;
  level: number;
  minSalary: number;
  maxSalary: number;
  currency?: string;
  headCount?: number;
  requirements?: string;
  responsibilities?: string;
}

// =====================================
// SHIFT DTOs
// =====================================

export interface ShiftDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  breakDurationMinutes: number;
  workHoursPerDay: number;
  isNightShift: boolean;
  nightShiftAllowancePercentage?: number;
  gracePeriodMinutes?: number;
  earlyDepartureThresholdMinutes?: number;
  overtimeThresholdMinutes?: number;
  isFlexible: boolean;
  flexibleStartTime?: string;
  flexibleEndTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  employeeCount: number;
}

export interface CreateShiftDto {
  code: string;
  name: string;
  description?: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  breakDurationMinutes: number;
  nightShiftAllowancePercentage?: number;
  gracePeriodMinutes?: number;
  earlyDepartureThresholdMinutes?: number;
  overtimeThresholdMinutes?: number;
  isFlexible: boolean;
  flexibleStartTime?: string;
  flexibleEndTime?: string;
}

export interface UpdateShiftDto {
  name: string;
  description?: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  breakDurationMinutes: number;
  nightShiftAllowancePercentage?: number;
  gracePeriodMinutes?: number;
  earlyDepartureThresholdMinutes?: number;
  overtimeThresholdMinutes?: number;
  isFlexible: boolean;
  flexibleStartTime?: string;
  flexibleEndTime?: string;
}

// =====================================
// WORK SCHEDULE DTOs
// =====================================

export interface WorkScheduleDto {
  id: number;
  employeeId: number;
  employeeName: string;
  shiftId: number;
  shiftName: string;
  date: string;
  isWorkDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  customStartTime?: string;
  customEndTime?: string;
  notes?: string;
  createdAt: string;
}

export interface AssignWorkScheduleDto {
  employeeId: number;
  shiftId: number;
  startDate: string;
  endDate?: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  notes?: string;
}

export interface CreateWorkScheduleDto {
  employeeId: number;
  shiftId: number;
  date: string;
  isWorkDay: boolean;
  customStartTime?: string;
  customEndTime?: string;
  notes?: string;
}

export interface UpdateWorkScheduleDto {
  shiftId: number;
  isWorkDay: boolean;
  customStartTime?: string;
  customEndTime?: string;
  notes?: string;
}

// =====================================
// ATTENDANCE DTOs
// =====================================

export interface AttendanceDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workedHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  status: AttendanceStatus;
  shiftId?: number;
  shiftName?: string;
  checkInSource?: string;
  checkOutSource?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  isManualEntry: boolean;
  notes?: string;
  createdAt: string;
}

export interface AttendanceSummaryDto {
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  totalWorkDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  earlyDepartureDays: number;
  leaveDays: number;
  holidayDays: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  totalLateMinutes: number;
  attendancePercentage: number;
}

export interface CheckInDto {
  employeeId: number;
  checkInTime?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface CheckOutDto {
  employeeId: number;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface UpdateAttendanceDto {
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  notes?: string;
  isManualEntry?: boolean;
}

export interface DailyAttendanceSummaryDto {
  date: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
  departmentId?: number;
  departmentName?: string;
  attendanceRate: number;
  records: AttendanceDto[];
}

export interface AttendanceReportDto {
  year: number;
  month: number;
  employeeId?: number;
  employeeName?: string;
  departmentId?: number;
  departmentName?: string;
  totalWorkDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  totalLateMinutes: number;
  attendancePercentage: number;
  employeeSummaries: AttendanceSummaryDto[];
}

// =====================================
// LEAVE TYPE DTOs
// =====================================

export interface LeaveTypeDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  defaultDays: number;
  isPaid: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  allowHalfDay: boolean;
  allowNegativeBalance: boolean;
  carryForward: boolean;
  maxCarryForwardDays?: number;
  isActive: boolean;
  color?: string;
  createdAt: string;
}

export interface CreateLeaveTypeDto {
  code: string;
  name: string;
  description?: string;
  defaultDays: number;
  isPaid?: boolean;
  requiresApproval?: boolean;
  requiresDocument?: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  allowHalfDay?: boolean;
  allowNegativeBalance?: boolean;
  carryForward?: boolean;
  maxCarryForwardDays?: number;
  color?: string;
}

export interface UpdateLeaveTypeDto {
  name: string;
  description?: string;
  defaultDays: number;
  isPaid: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  maxConsecutiveDays?: number;
  minNoticeDays?: number;
  allowHalfDay: boolean;
  allowNegativeBalance: boolean;
  carryForward: boolean;
  maxCarryForwardDays?: number;
  color?: string;
}

// =====================================
// LEAVE DTOs
// =====================================

export interface LeaveDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeColor?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  isHalfDayMorning: boolean;
  reason?: string;
  status: LeaveStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedDate?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  requestDate: string;
  attachmentUrl?: string;
  contactDuringLeave?: string;
  handoverNotes?: string;
  substituteEmployeeId?: number;
  substituteEmployeeName?: string;
  createdAt: string;
}

export interface CreateLeaveDto {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  isHalfDayMorning: boolean;
  reason?: string;
  contactDuringLeave?: string;
  handoverNotes?: string;
  substituteEmployeeId?: number;
}

export interface UpdateLeaveDto {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  isHalfDayMorning: boolean;
  reason?: string;
  contactDuringLeave?: string;
  handoverNotes?: string;
  substituteEmployeeId?: number;
}

export interface ApproveLeaveDto {
  notes?: string;
}

export interface RejectLeaveDto {
  reason: string;
}

export interface LeaveBalanceDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  entitled: number;
  used: number;
  pending: number;
  carriedForward: number;
  adjustment: number;
  adjustmentReason?: string;
  available: number;
}

export interface EmployeeLeaveSummaryDto {
  employeeId: number;
  employeeName: string;
  year: number;
  balances: LeaveBalanceDto[];
  totalEntitled: number;
  totalUsed: number;
  totalPending: number;
  totalAvailable: number;
}

// =====================================
// HOLIDAY DTOs
// =====================================

export interface HolidayDto {
  id: number;
  name: string;
  description?: string;
  date: string;
  year: number;
  isRecurring: boolean;
  recurringMonth?: number;
  recurringDay?: number;
  holidayType?: string;
  isHalfDay: boolean;
  isNational: boolean;
  affectedRegions?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHolidayDto {
  name: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  holidayType?: string;
  isHalfDay: boolean;
  isNational?: boolean;
  affectedRegions?: string;
}

export interface UpdateHolidayDto {
  name: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  holidayType?: string;
  isHalfDay: boolean;
  isNational: boolean;
  affectedRegions?: string;
}

export interface HolidayCalendarDto {
  year: number;
  totalHolidays: number;
  nationalHolidays: number;
  regionalHolidays: number;
  holidays: HolidayDto[];
}

// =====================================
// WORK LOCATION DTOs
// =====================================

export interface WorkLocationDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  timeZone?: string;
  isHeadquarters: boolean;
  isRemote: boolean;
  capacity?: number;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkLocationDto {
  code: string;
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  timeZone?: string;
  isHeadquarters: boolean;
  isRemote: boolean;
  capacity?: number;
}

export interface UpdateWorkLocationDto {
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  timeZone?: string;
  isHeadquarters: boolean;
  isRemote: boolean;
  capacity?: number;
}

// =====================================
// PAYROLL DTOs
// =====================================

export interface PayrollDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  departmentName?: string;
  payrollNumber: string;
  year: number;
  month: number;
  periodStartDate: string;
  periodEndDate: string;
  baseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  totalEmployerCost: number;
  netSalary: number;
  grossSalary: number;
  currency: string;
  status: PayrollStatus;
  calculatedDate?: string;
  calculatedById?: number;
  calculatedByName?: string;
  approvedDate?: string;
  approvedById?: number;
  approvedByName?: string;
  paidDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  items: PayrollItemDto[];
}

export interface PayrollItemDto {
  id: number;
  payrollId: number;
  itemType: string;
  itemCode: string;
  description: string;
  amount: number;
  isDeduction: boolean;
  isEmployerContribution: boolean;
  isTaxable: boolean;
  quantity?: number;
  rate?: number;
}

export interface CreatePayrollDto {
  employeeId: number;
  year: number;
  month: number;
  notes?: string;
}

export interface BatchCreatePayrollDto {
  year: number;
  month: number;
  employeeIds?: number[];
  departmentId?: number;
  includeAllActiveEmployees: boolean;
}

export interface AddPayrollItemDto {
  itemType: string;
  itemCode: string;
  description: string;
  amount: number;
  isDeduction: boolean;
  isEmployerContribution: boolean;
  isTaxable: boolean;
  quantity?: number;
  rate?: number;
}

export interface PayrollSummaryDto {
  year: number;
  month: number;
  totalEmployees: number;
  draftCount: number;
  calculatedCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  paidCount: number;
  totalBaseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  totalEmployerCost: number;
  totalNetSalary: number;
  totalGrossSalary: number;
  currency: string;
}

export interface ApprovePayrollDto {
  notes?: string;
}

export interface MarkPayrollPaidDto {
  paymentReference?: string;
  paidDate?: string;
}

// =====================================
// EXPENSE DTOs
// =====================================

export interface ExpenseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  departmentName?: string;
  expenseNumber: string;
  expenseType: ExpenseType;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  merchantName?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedDate?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  paidDate?: string;
  paymentReference?: string;
  payrollId?: number;
  notes?: string;
  createdAt: string;
}

export interface CreateExpenseDto {
  employeeId: number;
  expenseType: ExpenseType;
  description: string;
  amount: number;
  currency?: string;
  expenseDate: string;
  merchantName?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface UpdateExpenseDto {
  expenseType: ExpenseType;
  description: string;
  amount: number;
  expenseDate: string;
  merchantName?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface ApproveExpenseDto {
  notes?: string;
}

export interface RejectExpenseDto {
  reason: string;
}

export interface ExpenseSummaryDto {
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
  totalCount: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  paidCount: number;
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  currency: string;
}

// =====================================
// PERFORMANCE DTOs
// =====================================

export interface PerformanceReviewDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  departmentName?: string;
  positionTitle?: string;
  reviewerId: number;
  reviewerName: string;
  reviewPeriod: string;
  reviewDate: string;
  dueDate?: string;
  reviewType: string;
  overallRating?: PerformanceRating;
  overallScore?: number;
  strengths?: string;
  areasForImprovement?: string;
  managerComments?: string;
  employeeComments?: string;
  developmentPlan?: string;
  status: string;
  submittedDate?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedDate?: string;
  isEmployeeAcknowledged: boolean;
  employeeAcknowledgedDate?: string;
  createdAt: string;
  criteria: PerformanceReviewCriteriaDto[];
}

export interface PerformanceReviewCriteriaDto {
  id: number;
  performanceReviewId: number;
  criteriaName: string;
  description?: string;
  weight: number;
  rating?: PerformanceRating;
  score?: number;
  comments?: string;
}

export interface CreatePerformanceReviewDto {
  employeeId: number;
  reviewerId: number;
  reviewPeriod: string;
  reviewDate: string;
  dueDate?: string;
  reviewType?: string;
  criteria?: CreateReviewCriteriaDto[];
}

export interface CreateReviewCriteriaDto {
  criteriaName: string;
  description?: string;
  weight?: number;
}

export interface UpdatePerformanceReviewDto {
  strengths?: string;
  areasForImprovement?: string;
  managerComments?: string;
  developmentPlan?: string;
}

export interface CompleteReviewDto {
  overallRating: PerformanceRating;
  finalComments?: string;
}

export interface AcknowledgeReviewDto {
  employeeComments?: string;
}

export interface PerformanceGoalDto {
  id: number;
  employeeId: number;
  employeeName: string;
  title: string;
  description?: string;
  category?: string;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  weight: number;
  progressPercentage: number;
  status: string;
  metrics?: string;
  targetValue?: string;
  currentValue?: string;
  performanceReviewId?: number;
  assignedById?: number;
  assignedByName?: string;
  notes?: string;
  isOverdue: boolean;
  createdAt: string;
}

export interface CreatePerformanceGoalDto {
  employeeId: number;
  title: string;
  description?: string;
  category?: string;
  startDate: string;
  targetDate: string;
  weight?: number;
  metrics?: string;
  targetValue?: string;
  performanceReviewId?: number;
}

export interface UpdatePerformanceGoalDto {
  title: string;
  description?: string;
  category?: string;
  targetDate: string;
  weight: number;
  metrics?: string;
  targetValue?: string;
}

export interface UpdateGoalProgressDto {
  progress: number;
  notes?: string;
}

export interface PerformanceSummaryDto {
  employeeId: number;
  employeeName: string;
  totalReviews: number;
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  overdueGoals: number;
  averageRating: number;
  latestRating?: PerformanceRating;
  goalCompletionRate: number;
}

// =====================================
// TRAINING DTOs
// =====================================

export interface TrainingDto {
  id: number;
  code: string;
  title: string;
  description?: string;
  trainingType?: string;
  provider?: string;
  instructor?: string;
  location?: string;
  isOnline: boolean;
  onlineUrl?: string;
  startDate?: string;
  endDate?: string;
  durationHours: number;
  maxParticipants?: number;
  currentParticipants: number;
  cost?: number;
  currency?: string;
  status: TrainingStatus;
  isMandatory: boolean;
  hasCertification: boolean;
  certificationValidityMonths?: number;
  passingScore?: number;
  prerequisites?: string;
  materials?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateTrainingDto {
  code: string;
  title: string;
  description?: string;
  trainingType?: string;
  provider?: string;
  instructor?: string;
  location?: string;
  isOnline: boolean;
  onlineUrl?: string;
  startDate?: string;
  endDate?: string;
  durationHours: number;
  maxParticipants?: number;
  cost?: number;
  currency?: string;
  isMandatory: boolean;
  hasCertification: boolean;
  certificationValidityMonths?: number;
  passingScore?: number;
  prerequisites?: string;
  materials?: string;
}

export interface UpdateTrainingDto {
  title: string;
  description?: string;
  trainingType?: string;
  provider?: string;
  instructor?: string;
  location?: string;
  isOnline: boolean;
  onlineUrl?: string;
  startDate?: string;
  endDate?: string;
  durationHours: number;
  maxParticipants?: number;
  cost?: number;
  currency?: string;
  isMandatory: boolean;
  hasCertification: boolean;
  certificationValidityMonths?: number;
  passingScore?: number;
  prerequisites?: string;
  materials?: string;
}

export interface EmployeeTrainingDto {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  trainingId: number;
  trainingTitle: string;
  enrollmentDate: string;
  status: EmployeeTrainingStatus;
  completedDate?: string;
  score?: number;
  isPassed: boolean;
  certificateNumber?: string;
  certificateUrl?: string;
  certificateIssueDate?: string;
  certificateExpiryDate?: string;
  feedback?: string;
  feedbackRating?: number;
  notes?: string;
  cancellationReason?: string;
  isCertificateExpired: boolean;
  createdAt: string;
}

export interface EnrollEmployeeDto {
  employeeId: number;
  notes?: string;
}

export interface BatchEnrollEmployeesDto {
  trainingId: number;
  employeeIds: number[];
}

export interface CompleteTrainingDto {
  score?: number;
  isPassed?: boolean;
  completionNotes?: string;
}

export interface TrainingSummaryDto {
  totalTrainings: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  totalEnrollments: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  passRate: number;
}

// =====================================
// DOCUMENT DTOs
// =====================================

export interface EmployeeDocumentDto {
  id: number;
  employeeId: number;
  employeeName: string;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  isVerified: boolean;
  verifiedById?: number;
  verifiedByName?: string;
  verifiedDate?: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateEmployeeDocumentDto {
  employeeId: number;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  description?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface UpdateEmployeeDocumentDto {
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  description?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface VerifyDocumentDto {
  notes?: string;
}

export interface ExpiringDocumentsReportDto {
  totalExpiring: number;
  expiredCount: number;
  expiringIn30DaysCount: number;
  expiringIn60DaysCount: number;
  expiringIn90DaysCount: number;
  expiringDocuments: EmployeeDocumentDto[];
}

// =====================================
// ANNOUNCEMENT DTOs
// =====================================

export interface AnnouncementDto {
  id: number;
  title: string;
  content: string;
  summary?: string;
  announcementType: string;
  priority: string;
  authorId: number;
  authorName: string;
  publishDate: string;
  expiryDate?: string;
  isPublished: boolean;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  targetDepartmentId?: number;
  targetDepartmentName?: string;
  attachmentUrl?: string;
  viewCount: number;
  acknowledgmentCount: number;
  isExpired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnouncementSummaryDto {
  id: number;
  title: string;
  summary?: string;
  announcementType: string;
  priority: string;
  authorName: string;
  publishDate: string;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  isAcknowledged: boolean;
  viewCount: number;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  summary?: string;
  announcementType?: string;
  priority?: string;
  authorId: number;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  targetDepartmentId?: number;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  summary?: string;
  announcementType: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  targetDepartmentId?: number;
}

export interface AnnouncementAcknowledgmentDto {
  id: number;
  announcementId: number;
  announcementTitle: string;
  employeeId: number;
  employeeName: string;
  acknowledgedDate: string;
  comments?: string;
}

export interface AcknowledgeAnnouncementDto {
  comments?: string;
}

export interface AnnouncementStatisticsDto {
  announcementId: number;
  title: string;
  totalTargetEmployees: number;
  viewCount: number;
  acknowledgmentCount: number;
  viewRate: number;
  acknowledgmentRate: number;
  acknowledgments: AnnouncementAcknowledgmentDto[];
}

// =====================================
// FILTER DTOs
// =====================================

export interface EmployeeFilterDto {
  departmentId?: number;
  positionId?: number;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  searchTerm?: string;
  includeInactive?: boolean;
}

export interface AttendanceFilterDto {
  employeeId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

export interface LeaveFilterDto {
  employeeId?: number;
  departmentId?: number;
  leaveTypeId?: number;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

export interface PayrollFilterDto {
  year?: number;
  month?: number;
  employeeId?: number;
  departmentId?: number;
  status?: PayrollStatus;
}

export interface ExpenseFilterDto {
  employeeId?: number;
  departmentId?: number;
  expenseType?: ExpenseType;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
}

export interface TrainingFilterDto {
  status?: TrainingStatus;
  trainingType?: string;
  startDate?: string;
  endDate?: string;
  isMandatory?: boolean;
}
