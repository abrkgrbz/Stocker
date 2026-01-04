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
  birthPlace?: string;
  gender?: Gender;
  maritalStatus?: string;
  nationality?: string;
  bloodType?: string;
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
  // Detaylı Kesinti Alanları
  incomeTax: number;
  socialSecurityEmployee: number;
  unemploymentInsuranceEmployee: number;
  stampTax: number;
  otherDeductions: number;
  // İşveren Maliyetleri
  socialSecurityEmployer: number;
  unemploymentInsuranceEmployer: number;
  // Türkiye Vergi Hesaplama Alanları
  cumulativeGrossEarnings: number;
  minWageExemption: number;
  taxBase: number;
  taxBracket: number;
  taxBracketRate: number;
  sgkCeilingApplied: boolean;
  sgkBase: number;
  effectiveTaxRate: number;
  // Kazanç Detayları
  overtimePay: number;
  bonus: number;
  allowances: number;
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
  // Kazançlar
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: number;
  // Otomatik Hesaplama
  autoCalculate: boolean;
  cumulativeGrossEarnings: number;
  applyMinWageExemption: boolean;
  // Manuel Giriş (autoCalculate = false ise)
  incomeTax?: number;
  socialSecurityEmployee?: number;
  unemploymentInsuranceEmployee?: number;
  stampTax?: number;
  otherDeductions?: number;
}

// Türk Bordro Hesaplama Parametreleri
export interface TurkishPayrollParameters {
  minimumWage: number;
  sgkCeiling: number;
  sgkEmployeeInsurance: number;
  sgkEmployeeUnemployment: number;
  sgkEmployerInsurance: number;
  sgkEmployerUnemployment: number;
  stampTaxRate: number;
  taxBrackets: TaxBracket[];
  year: number;
}

export interface TaxBracket {
  minAmount: number;
  maxAmount: number;
  rate: number;
  bracketNumber: number;
}

// Bordro Hesaplama Sonucu
export interface PayrollCalculationResult {
  grossEarnings: number;
  sgkBase: number;
  sgkCeilingApplied: boolean;
  sgkInsuranceEmployee: number;
  sgkUnemploymentEmployee: number;
  sgkInsuranceEmployer: number;
  sgkUnemploymentEmployer: number;
  stampTax: number;
  taxBase: number;
  taxBracket: number;
  taxBracketRate: number;
  incomeTax: number;
  minWageExemption: number;
  totalDeductions: number;
  netSalary: number;
  totalEmployerCost: number;
  effectiveTaxRate: number;
}

// Hesaplama Önizleme DTO
export interface CalculatePreviewDto {
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowances: number;
  cumulativeGrossEarnings: number;
  applyMinWageExemption: boolean;
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
  // UI field
  isReimbursable?: boolean;
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

// =====================================
// CAREER PATH DTOs
// =====================================

export interface CareerPathDto {
  id: number;
  employeeId: number;
  employeeName: string;
  pathName: string;
  status: string;
  careerTrack: string;
  // Current State
  currentPositionId: number;
  currentPositionName: string;
  currentLevel: number;
  currentPositionStartDate: string;
  // Target Information
  targetPositionId?: number;
  targetPositionName?: string;
  targetLevel?: number;
  expectedTargetDate?: string;
  targetTimelineMonths?: number;
  // Progress
  progressPercentage: number;
  readinessScore?: number;
  readyForPromotion: boolean;
  lastAssessmentDate?: string;
  // Development Plan
  developmentAreas?: string;
  requiredCompetencies?: string;
  requiredCertifications?: string;
  requiredTraining?: string;
  requiredExperienceYears?: number;
  // Mentorship
  mentorId?: number;
  mentorName?: string;
  mentorAssignmentDate?: string;
  mentorshipNotes?: string;
  // Manager Assessment
  managerAssessment?: string;
  managerRecommendation?: string;
  lastManagerMeetingDate?: string;
  // Additional Information
  notes?: string;
  startDate: string;
  endDate?: string;
  nextReviewDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCareerPathDto {
  employeeId: number;
  pathName: string;
  careerTrack: string;
  currentPositionId: number;
  currentLevel: number;
  targetPositionId?: number;
  targetLevel?: number;
  expectedTargetDate?: string;
  targetTimelineMonths?: number;
  developmentAreas?: string;
  requiredCompetencies?: string;
  requiredCertifications?: string;
  requiredTraining?: string;
  requiredExperienceYears?: number;
  mentorId?: number;
  notes?: string;
  startDate: string;
}

export interface UpdateCareerPathDto {
  pathName: string;
  status: string;
  careerTrack: string;
  targetPositionId?: number;
  targetLevel?: number;
  expectedTargetDate?: string;
  targetTimelineMonths?: number;
  progressPercentage: number;
  readinessScore?: number;
  readyForPromotion: boolean;
  developmentAreas?: string;
  requiredCompetencies?: string;
  requiredCertifications?: string;
  requiredTraining?: string;
  requiredExperienceYears?: number;
  mentorId?: number;
  mentorshipNotes?: string;
  managerAssessment?: string;
  managerRecommendation?: string;
  notes?: string;
  endDate?: string;
  nextReviewDate?: string;
}

// =====================================
// CERTIFICATION DTOs
// =====================================

export interface CertificationDto {
  id: number;
  employeeId: number;
  employeeName: string;
  certificationName: string;
  certificationType: string;
  status: string;
  // Issuing Authority
  issuingAuthority: string;
  issuingCountry?: string;
  accreditationBody?: string;
  // Certification Details
  certificationNumber?: string;
  credentialId?: string;
  verificationUrl?: string;
  certificationLevel?: string;
  specialization?: string;
  // Dates
  issueDate: string;
  expiryDate?: string;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  // Training Information
  trainingRequired: boolean;
  totalTrainingHours?: number;
  completedTrainingHours?: number;
  trainingProvider?: string;
  trainingCompletionDate?: string;
  // Exam Information
  examRequired: boolean;
  examDate?: string;
  examScore?: number;
  passingScore?: number;
  attemptNumber: number;
  // Cost Information
  certificationCost?: number;
  renewalCost?: number;
  companySponsored: boolean;
  currency: string;
  // CPE/CEU Information
  cpeRequired: boolean;
  requiredCpeUnits?: number;
  earnedCpeUnits?: number;
  cpePeriodStart?: string;
  cpePeriodEnd?: string;
  // Document Information
  certificateFileUrl?: string;
  badgeUrl?: string;
  // Additional Information
  description?: string;
  notes?: string;
  requiredForJob: boolean;
  reminderSent: boolean;
  reminderDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Computed Properties
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export interface CreateCertificationDto {
  employeeId: number;
  certificationName: string;
  certificationType: string;
  issuingAuthority: string;
  issuingCountry?: string;
  accreditationBody?: string;
  certificationNumber?: string;
  credentialId?: string;
  verificationUrl?: string;
  certificationLevel?: string;
  specialization?: string;
  issueDate: string;
  expiryDate?: string;
  trainingRequired: boolean;
  totalTrainingHours?: number;
  trainingProvider?: string;
  examRequired: boolean;
  examDate?: string;
  examScore?: number;
  passingScore?: number;
  certificationCost?: number;
  renewalCost?: number;
  companySponsored: boolean;
  currency?: string;
  cpeRequired: boolean;
  requiredCpeUnits?: number;
  description?: string;
  notes?: string;
  requiredForJob: boolean;
}

export interface UpdateCertificationDto {
  certificationName: string;
  certificationType: string;
  status: string;
  issuingAuthority: string;
  issuingCountry?: string;
  accreditationBody?: string;
  certificationNumber?: string;
  credentialId?: string;
  verificationUrl?: string;
  certificationLevel?: string;
  specialization?: string;
  expiryDate?: string;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  trainingRequired: boolean;
  totalTrainingHours?: number;
  completedTrainingHours?: number;
  trainingProvider?: string;
  trainingCompletionDate?: string;
  examRequired: boolean;
  examScore?: number;
  passingScore?: number;
  attemptNumber: number;
  certificationCost?: number;
  renewalCost?: number;
  companySponsored: boolean;
  cpeRequired: boolean;
  requiredCpeUnits?: number;
  earnedCpeUnits?: number;
  cpePeriodStart?: string;
  cpePeriodEnd?: string;
  description?: string;
  notes?: string;
  requiredForJob: boolean;
}

// =====================================
// DISCIPLINARY ACTION DTOs
// =====================================

export interface DisciplinaryActionDto {
  id: number;
  employeeId: number;
  employeeName: string;
  actionCode: string;
  actionType: string;
  status: string;
  severityLevel: string;
  // Incident Information
  incidentDate: string;
  incidentLocation?: string;
  incidentDescription: string;
  violatedPolicy?: string;
  witnesses?: string;
  evidence?: string;
  // Investigation
  investigationStartDate?: string;
  investigationEndDate?: string;
  investigatorId?: number;
  investigatorName?: string;
  investigationNotes?: string;
  investigationFindings?: string;
  // Defense
  defenseRequested: boolean;
  defenseDeadline?: string;
  defenseReceived: boolean;
  defenseDate?: string;
  defenseText?: string;
  // Decision
  decisionDate?: string;
  decisionMakerId?: number;
  decisionMakerName?: string;
  decision?: string;
  decisionRationale?: string;
  // Applied Sanction
  appliedSanction?: string;
  sanctionDetails?: string;
  sanctionStartDate?: string;
  sanctionEndDate?: string;
  sanctionDurationDays?: number;
  salaryDeductionAmount?: number;
  currency: string;
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  hasPerformanceImprovementPlan: boolean;
  performanceImprovementPlanId?: number;
  // Appeal
  wasAppealed: boolean;
  appealDate?: string;
  appealOutcome?: string;
  appealNotes?: string;
  // Additional Information
  reportedById?: number;
  reportedByName?: string;
  hrRepresentativeId?: number;
  hrRepresentativeName?: string;
  isConfidential: boolean;
  previousWarningsCount: number;
  internalNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDisciplinaryActionDto {
  employeeId: number;
  actionType: string;
  severityLevel: string;
  incidentDate: string;
  incidentLocation?: string;
  incidentDescription: string;
  violatedPolicy?: string;
  witnesses?: string;
  evidence?: string;
  reportedById?: number;
  hrRepresentativeId?: number;
  isConfidential: boolean;
}

export interface UpdateDisciplinaryActionDto {
  actionType: string;
  status: string;
  severityLevel: string;
  incidentDescription: string;
  violatedPolicy?: string;
  witnesses?: string;
  evidence?: string;
  investigationStartDate?: string;
  investigationEndDate?: string;
  investigatorId?: number;
  investigationNotes?: string;
  investigationFindings?: string;
  defenseRequested: boolean;
  defenseDeadline?: string;
  defenseReceived: boolean;
  defenseDate?: string;
  defenseText?: string;
  decisionDate?: string;
  decisionMakerId?: number;
  decision?: string;
  decisionRationale?: string;
  appliedSanction?: string;
  sanctionDetails?: string;
  sanctionStartDate?: string;
  sanctionEndDate?: string;
  sanctionDurationDays?: number;
  salaryDeductionAmount?: number;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  wasAppealed: boolean;
  appealDate?: string;
  appealOutcome?: string;
  appealNotes?: string;
  internalNotes?: string;
}

// =====================================
// EMPLOYEE ASSET DTOs
// =====================================

export interface EmployeeAssetDto {
  id: number;
  employeeId: number;
  employeeName: string;
  assetType: string;
  status: string;
  // Asset Information
  assetName: string;
  assetCode?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  description?: string;
  // Value Information
  purchaseValue?: number;
  currentValue?: number;
  currency: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  // Assignment Information
  assignmentDate: string;
  returnDate?: string;
  expectedReturnDate?: string;
  assignedById?: number;
  assignedByName?: string;
  receivedById?: number;
  receivedByName?: string;
  // Location Information
  location?: string;
  departmentId?: number;
  departmentName?: string;
  office?: string;
  // Condition Information
  conditionAtAssignment: string;
  conditionAtReturn?: string;
  conditionNotes?: string;
  hasDamage: boolean;
  damageDescription?: string;
  damageCost?: number;
  // IT Assets
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;
  operatingSystem?: string;
  softwareLicenses?: string;
  // Mobile Assets
  imei?: string;
  simCardNumber?: string;
  phoneNumber?: string;
  // Vehicle Assets
  licensePlate?: string;
  mileageAtAssignment?: number;
  mileageAtReturn?: number;
  fuelCardNumber?: string;
  // Documents
  assignmentFormSigned: boolean;
  assignmentFormUrl?: string;
  returnFormUrl?: string;
  photosJson?: string;
  // Additional Information
  notes?: string;
  tags?: string;
  inventoryItemId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Computed Properties
  isUnderWarranty: boolean;
}

export interface CreateEmployeeAssetDto {
  employeeId: number;
  assetType: string;
  assetName: string;
  assetCode?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  description?: string;
  purchaseValue?: number;
  currentValue?: number;
  currency?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  assignedById?: number;
  location?: string;
  departmentId?: number;
  office?: string;
  conditionAtAssignment: string;
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;
  operatingSystem?: string;
  softwareLicenses?: string;
  imei?: string;
  simCardNumber?: string;
  phoneNumber?: string;
  licensePlate?: string;
  mileageAtAssignment?: number;
  fuelCardNumber?: string;
  notes?: string;
  tags?: string;
  inventoryItemId?: number;
}

export interface UpdateEmployeeAssetDto {
  assetType: string;
  status: string;
  assetName: string;
  assetCode?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  description?: string;
  purchaseValue?: number;
  currentValue?: number;
  warrantyEndDate?: string;
  returnDate?: string;
  expectedReturnDate?: string;
  location?: string;
  departmentId?: number;
  office?: string;
  conditionAtReturn?: string;
  conditionNotes?: string;
  hasDamage: boolean;
  damageDescription?: string;
  damageCost?: number;
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;
  operatingSystem?: string;
  softwareLicenses?: string;
  imei?: string;
  simCardNumber?: string;
  phoneNumber?: string;
  licensePlate?: string;
  mileageAtReturn?: number;
  notes?: string;
  tags?: string;
}

// =====================================
// EMPLOYEE BENEFIT DTOs
// =====================================

export interface EmployeeBenefitDto {
  id: number;
  employeeId: number;
  employeeName: string;
  benefitType: string;
  benefitName: string;
  status: string;
  // Value Information
  amount: number;
  currency: string;
  paymentFrequency: string;
  annualValue?: number;
  taxIncluded: boolean;
  isTaxable: boolean;
  // Period Information
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  vestingDate?: string;
  waitingPeriodMonths?: number;
  // Health Insurance
  insuranceProvider?: string;
  policyNumber?: string;
  coverageLevel?: string;
  includesFamily: boolean;
  spouseCovered: boolean;
  childrenCovered: boolean;
  numberOfDependents?: number;
  // Vehicle
  vehiclePlate?: string;
  vehicleModel?: string;
  fuelAllowance?: number;
  mileageLimit?: number;
  // Phone/Internet
  phoneNumber?: string;
  monthlyLimit?: number;
  operator?: string;
  // Meal Card
  cardNumber?: string;
  dailyAmount?: number;
  cardProvider?: string;
  // Usage Information
  usedAmount?: number;
  remainingAmount?: number;
  lastUsageDate?: string;
  // Additional Information
  description?: string;
  notes?: string;
  documentUrl?: string;
  approvedById?: number;
  approvedByName?: string;
  approvalDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Computed Properties
  isExpired: boolean;
  isVested: boolean;
}

export interface CreateEmployeeBenefitDto {
  employeeId: number;
  benefitType: string;
  benefitName: string;
  amount: number;
  currency?: string;
  paymentFrequency: string;
  taxIncluded: boolean;
  isTaxable: boolean;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  vestingDate?: string;
  waitingPeriodMonths?: number;
  insuranceProvider?: string;
  policyNumber?: string;
  coverageLevel?: string;
  includesFamily: boolean;
  spouseCovered: boolean;
  childrenCovered: boolean;
  numberOfDependents?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  fuelAllowance?: number;
  mileageLimit?: number;
  phoneNumber?: string;
  monthlyLimit?: number;
  operator?: string;
  cardNumber?: string;
  dailyAmount?: number;
  cardProvider?: string;
  description?: string;
  notes?: string;
}

export interface UpdateEmployeeBenefitDto {
  benefitType: string;
  benefitName: string;
  status: string;
  amount: number;
  paymentFrequency: string;
  annualValue?: number;
  taxIncluded: boolean;
  isTaxable: boolean;
  endDate?: string;
  renewalDate?: string;
  vestingDate?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  coverageLevel?: string;
  includesFamily: boolean;
  spouseCovered: boolean;
  childrenCovered: boolean;
  numberOfDependents?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  fuelAllowance?: number;
  mileageLimit?: number;
  phoneNumber?: string;
  monthlyLimit?: number;
  operator?: string;
  cardNumber?: string;
  dailyAmount?: number;
  cardProvider?: string;
  usedAmount?: number;
  description?: string;
  notes?: string;
}

// =====================================
// ONBOARDING DTOs
// =====================================

export interface OnboardingDto {
  id: number;
  employeeId: number;
  employeeName?: string;
  status: string;
  templateId?: number;
  templateName?: string;
  startDate: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  firstDayOfWork: string;
  buddyId?: number;
  buddyName?: string;
  hrResponsibleId?: number;
  hrResponsibleName?: string;
  itResponsibleId?: number;
  itResponsibleName?: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  // Equipment
  laptopProvided: boolean;
  phoneProvided: boolean;
  accessCardProvided: boolean;
  equipmentNotes?: string;
  // IT Setup
  emailAccountCreated: boolean;
  adAccountCreated: boolean;
  systemAccessGranted: boolean;
  vpnAccessGranted: boolean;
  // Documents
  contractSigned: boolean;
  ndaSigned: boolean;
  policiesAcknowledged: boolean;
  bankDetailsReceived: boolean;
  emergencyContactReceived: boolean;
  // Training
  orientationCompleted: boolean;
  safetyTrainingCompleted: boolean;
  complianceTrainingCompleted: boolean;
  productTrainingCompleted: boolean;
  // Feedback
  week1FeedbackReceived: boolean;
  month1FeedbackReceived: boolean;
  month3FeedbackReceived: boolean;
  employeeFeedback?: string;
  managerFeedback?: string;
  // Other
  welcomeKitSent: boolean;
  deskPrepared: boolean;
  teamIntroductionDone: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOnboardingDto {
  employeeId: number;
  templateId?: number;
  startDate: string;
  plannedEndDate?: string;
  firstDayOfWork: string;
  buddyId?: number;
  hrResponsibleId?: number;
  itResponsibleId?: number;
  notes?: string;
}

export interface UpdateOnboardingDto {
  status: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  buddyId?: number;
  hrResponsibleId?: number;
  itResponsibleId?: number;
  laptopProvided: boolean;
  phoneProvided: boolean;
  accessCardProvided: boolean;
  equipmentNotes?: string;
  emailAccountCreated: boolean;
  adAccountCreated: boolean;
  systemAccessGranted: boolean;
  vpnAccessGranted: boolean;
  contractSigned: boolean;
  ndaSigned: boolean;
  policiesAcknowledged: boolean;
  bankDetailsReceived: boolean;
  emergencyContactReceived: boolean;
  orientationCompleted: boolean;
  safetyTrainingCompleted: boolean;
  complianceTrainingCompleted: boolean;
  productTrainingCompleted: boolean;
  week1FeedbackReceived: boolean;
  month1FeedbackReceived: boolean;
  month3FeedbackReceived: boolean;
  employeeFeedback?: string;
  managerFeedback?: string;
  welcomeKitSent: boolean;
  deskPrepared: boolean;
  teamIntroductionDone: boolean;
  notes?: string;
}

// =====================================
// PAYSLIP DTOs
// =====================================

export interface PayslipDto {
  id: number;
  employeeId: number;
  employeeName?: string;
  payrollId: number;
  payslipNumber: string;
  status: string;
  period: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  // Earnings
  grossSalary: number;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  gratuity: number;
  commission: number;
  otherEarnings: number;
  totalEarnings: number;
  // Allowances
  transportationAllowance: number;
  mealAllowance: number;
  housingAllowance: number;
  phoneAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  // Deductions
  incomeTax: number;
  stampTax: number;
  ssiEmployeeShare: number;
  unemploymentInsuranceEmployee: number;
  privatePensionDeduction: number;
  unionDues: number;
  garnishment: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  // Employer Cost
  ssiEmployerShare: number;
  unemploymentInsuranceEmployer: number;
  privatePensionEmployer: number;
  totalEmployerCost: number;
  // Net
  netSalary: number;
  paidAmount: number;
  currency: string;
  // Work Details
  daysWorked: number;
  hoursWorked: number;
  overtimeHours: number;
  leaveDays: number;
  absenceDays: number;
  holidayDays: number;
  // Cumulative
  cumulativeGross: number;
  cumulativeIncomeTax: number;
  cumulativeSsiBase: number;
  // Payment Info
  bankName?: string;
  iban?: string;
  paymentMethod: string;
  paymentReference?: string;
  pdfUrl?: string;
  generatedDate: string;
  sentDate?: string;
  viewedDate?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePayslipDto {
  employeeId: number;
  payrollId: number;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  baseSalary: number;
  overtimePay?: number;
  bonus?: number;
  gratuity?: number;
  commission?: number;
  otherEarnings?: number;
  transportationAllowance?: number;
  mealAllowance?: number;
  housingAllowance?: number;
  phoneAllowance?: number;
  otherAllowances?: number;
  notes?: string;
}

// =====================================
// OVERTIME DTOs
// =====================================

export interface OvertimeDto {
  id: number;
  employeeId: number;
  employeeName?: string;
  overtimeType: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedHours: number;
  actualHours?: number;
  breakMinutes: number;
  payMultiplier: number;
  calculatedAmount?: number;
  currency: string;
  projectId?: number;
  projectName?: string;
  taskId?: string;
  costCenter?: string;
  reason: string;
  description?: string;
  workDetails?: string;
  requestDate: string;
  approvedById?: number;
  approvedByName?: string;
  approvalDate?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  isPaid: boolean;
  paidDate?: string;
  payrollId?: number;
  isCompensatoryTimeOff: boolean;
  compensatoryHoursEarned?: number;
  compensatoryHoursUsed?: number;
  isPreApproved: boolean;
  isEmergency: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOvertimeDto {
  employeeId: number;
  overtimeType: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedHours: number;
  breakMinutes?: number;
  payMultiplier?: number;
  projectId?: number;
  taskId?: string;
  costCenter?: string;
  reason: string;
  description?: string;
  workDetails?: string;
  isCompensatoryTimeOff: boolean;
  isPreApproved: boolean;
  isEmergency: boolean;
  notes?: string;
}

export interface UpdateOvertimeDto {
  overtimeType: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedHours: number;
  actualHours?: number;
  breakMinutes: number;
  payMultiplier: number;
  projectId?: number;
  taskId?: string;
  costCenter?: string;
  reason: string;
  description?: string;
  workDetails?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  isCompensatoryTimeOff: boolean;
  compensatoryHoursEarned?: number;
  compensatoryHoursUsed?: number;
  notes?: string;
}

// =====================================
// TIMESHEET DTOs
// =====================================

export interface TimeSheetDto {
  id: number;
  employeeId: number;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalWorkHours: number;
  regularHours: number;
  overtimeHours: number;
  leaveHours: number;
  holidayHours: number;
  billableHours: number;
  nonBillableHours: number;
  submittedDate?: string;
  approvedById?: number;
  approvedByName?: string;
  approvalDate?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  notes?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTimeSheetDto {
  employeeId: number;
  periodStart: string;
  periodEnd: string;
  totalWorkHours: number;
  regularHours: number;
  overtimeHours?: number;
  leaveHours?: number;
  holidayHours?: number;
  billableHours?: number;
  nonBillableHours?: number;
  notes?: string;
}

export interface UpdateTimeSheetDto {
  status: string;
  totalWorkHours: number;
  regularHours: number;
  overtimeHours: number;
  leaveHours: number;
  holidayHours: number;
  billableHours: number;
  nonBillableHours: number;
  approvalNotes?: string;
  rejectionReason?: string;
  notes?: string;
}

// =====================================
// SUCCESSION PLAN DTOs
// =====================================

export interface SuccessionPlanDto {
  id: number;
  planName: string;
  status: string;
  priority: string;
  positionId: number;
  positionTitle?: string;
  departmentId: number;
  departmentName?: string;
  currentIncumbentId?: number;
  currentIncumbentName?: string;
  isCriticalPosition: boolean;
  riskLevel: string;
  startDate: string;
  targetDate?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  expectedVacancyDate?: string;
  vacancyReason?: string;
  completionPercentage: number;
  hasReadyCandidate: boolean;
  hasEmergencyBackup: boolean;
  requiredCompetencies?: string;
  requiredExperienceYears?: number;
  requiredCertifications?: string;
  requiredEducation?: string;
  criticalSuccessFactors?: string;
  planOwnerId?: number;
  planOwnerName?: string;
  hrResponsibleId?: number;
  hrResponsibleName?: string;
  description?: string;
  notes?: string;
  externalHiringNeeded: boolean;
  budget?: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSuccessionPlanDto {
  planName: string;
  priority: string;
  positionId: number;
  departmentId: number;
  currentIncumbentId?: number;
  isCriticalPosition: boolean;
  riskLevel: string;
  startDate: string;
  targetDate?: string;
  expectedVacancyDate?: string;
  vacancyReason?: string;
  requiredCompetencies?: string;
  requiredExperienceYears?: number;
  requiredCertifications?: string;
  requiredEducation?: string;
  criticalSuccessFactors?: string;
  planOwnerId?: number;
  hrResponsibleId?: number;
  description?: string;
  notes?: string;
  externalHiringNeeded: boolean;
  budget?: number;
  currency?: string;
}

export interface UpdateSuccessionPlanDto {
  planName: string;
  status: string;
  priority: string;
  isCriticalPosition: boolean;
  riskLevel: string;
  targetDate?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  expectedVacancyDate?: string;
  vacancyReason?: string;
  completionPercentage: number;
  hasReadyCandidate: boolean;
  hasEmergencyBackup: boolean;
  requiredCompetencies?: string;
  requiredExperienceYears?: number;
  requiredCertifications?: string;
  requiredEducation?: string;
  criticalSuccessFactors?: string;
  planOwnerId?: number;
  hrResponsibleId?: number;
  description?: string;
  notes?: string;
  externalHiringNeeded: boolean;
  budget?: number;
}

// =====================================
// EMPLOYEE SKILL DTOs
// =====================================

export interface EmployeeSkillDto {
  id: number;
  employeeId: number;
  skillId?: number;
  skillName: string;
  category: string;
  skillType: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  selfAssessment?: number;
  managerAssessment?: number;
  lastAssessmentDate?: string;
  isVerified: boolean;
  verificationMethod?: string;
  verificationDate?: string;
  verifiedByUserId?: number;
  isCertified: boolean;
  certificationName?: string;
  certifyingAuthority?: string;
  certificationNumber?: string;
  certificationDate?: string;
  certificationExpiryDate?: string;
  certificationUrl?: string;
  isPrimary: boolean;
  isActivelyUsed: boolean;
  lastUsedDate?: string;
  usageFrequency?: string;
  notes?: string;
  learningSource?: string;
  relatedProjects?: string;
  canMentor: boolean;
  canTrain: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmployeeSkillDto {
  employeeId: number;
  skillId?: number;
  skillName: string;
  category: string;
  skillType: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  selfAssessment?: number;
  isCertified: boolean;
  certificationName?: string;
  certifyingAuthority?: string;
  certificationNumber?: string;
  certificationDate?: string;
  certificationExpiryDate?: string;
  certificationUrl?: string;
  isPrimary: boolean;
  isActivelyUsed: boolean;
  lastUsedDate?: string;
  usageFrequency?: string;
  notes?: string;
  learningSource?: string;
  canMentor: boolean;
  canTrain: boolean;
}

export interface UpdateEmployeeSkillDto {
  skillName: string;
  category: string;
  skillType: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  selfAssessment?: number;
  managerAssessment?: number;
  isVerified: boolean;
  verificationMethod?: string;
  isCertified: boolean;
  certificationName?: string;
  certifyingAuthority?: string;
  certificationNumber?: string;
  certificationDate?: string;
  certificationExpiryDate?: string;
  certificationUrl?: string;
  isPrimary: boolean;
  isActivelyUsed: boolean;
  lastUsedDate?: string;
  usageFrequency?: string;
  notes?: string;
  learningSource?: string;
  relatedProjects?: string;
  canMentor: boolean;
  canTrain: boolean;
}

// =====================================
// GRIEVANCE DTOs
// =====================================

export interface GrievanceDto {
  id: number;
  grievanceCode: string;
  complainantId: number;
  complainantName: string;
  status: string;
  grievanceType: string;
  priority: string;
  subject: string;
  description: string;
  incidentDate?: string;
  incidentLocation?: string;
  accusedPersonId?: number;
  accusedPersonName?: string;
  accusedPersonDescription?: string;
  witnesses?: string;
  evidence?: string;
  isAnonymous: boolean;
  isConfidential: boolean;
  retaliationProtectionRequested: boolean;
  assignedToId?: number;
  assignedToName?: string;
  hrRepresentativeId?: number;
  hrRepresentativeName?: string;
  assignedDate?: string;
  filedDate: string;
  acknowledgedDate?: string;
  targetResolutionDate?: string;
  resolutionDate?: string;
  closedDate?: string;
  investigationRequired: boolean;
  investigationStartDate?: string;
  investigationEndDate?: string;
  investigationNotes?: string;
  investigationFindings?: string;
  resolution?: string;
  resolutionType?: string;
  actionsTaken?: string;
  preventiveMeasures?: string;
  complainantSatisfied?: boolean;
  satisfactionFeedback?: string;
  satisfactionRating?: number;
  wasEscalated: boolean;
  escalationDate?: string;
  escalationReason?: string;
  escalationLevel: number;
  internalNotes?: string;
  category?: string;
  subcategory?: string;
  tags?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGrievanceDto {
  complainantId: number;
  grievanceType: string;
  priority: string;
  subject: string;
  description: string;
  incidentDate?: string;
  incidentLocation?: string;
  accusedPersonId?: number;
  accusedPersonDescription?: string;
  witnesses?: string;
  evidence?: string;
  isAnonymous: boolean;
  isConfidential: boolean;
  retaliationProtectionRequested: boolean;
  category?: string;
  subcategory?: string;
  tags?: string;
}

export interface UpdateGrievanceDto {
  status: string;
  grievanceType: string;
  priority: string;
  subject: string;
  description: string;
  assignedToId?: number;
  hrRepresentativeId?: number;
  targetResolutionDate?: string;
  investigationRequired: boolean;
  investigationStartDate?: string;
  investigationEndDate?: string;
  investigationNotes?: string;
  investigationFindings?: string;
  resolution?: string;
  resolutionType?: string;
  actionsTaken?: string;
  preventiveMeasures?: string;
  complainantSatisfied?: boolean;
  satisfactionFeedback?: string;
  satisfactionRating?: number;
  wasEscalated: boolean;
  escalationDate?: string;
  escalationReason?: string;
  escalationLevel: number;
  internalNotes?: string;
  category?: string;
  subcategory?: string;
  tags?: string;
}

// =====================================
// INTERVIEW DTOs
// =====================================

export interface InterviewDto {
  id: number;
  interviewType: string;
  round: number;
  status: string;
  jobApplicationId: number;
  candidateName?: string;
  interviewerId: number;
  interviewerName: string;
  scheduledDateTime: string;
  durationMinutes: number;
  timezone?: string;
  actualDateTime?: string;
  actualDurationMinutes?: number;
  format: string;
  location?: string;
  meetingRoom?: string;
  videoConferenceLink?: string;
  videoConferencePlatform?: string;
  phoneNumber?: string;
  topics?: string;
  questionsToAsk?: string;
  interviewerNotes?: string;
  candidateInstructions?: string;
  overallRating?: number;
  technicalCompetency?: number;
  communicationSkills?: number;
  problemSolving?: number;
  culturalFit?: number;
  leadershipPotential?: number;
  recommendation?: string;
  evaluationSummary?: string;
  strengths?: string;
  areasOfImprovement?: string;
  invitationSentToCandidate: boolean;
  invitationSentDate?: string;
  candidateConfirmed: boolean;
  reminderSent: boolean;
  cancellationReason?: string;
  cancelledBy?: string;
  wasRescheduled: boolean;
  previousDateTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInterviewDto {
  interviewType: string;
  round: number;
  jobApplicationId: number;
  interviewerId: number;
  scheduledDateTime: string;
  durationMinutes: number;
  timezone?: string;
  format: string;
  location?: string;
  meetingRoom?: string;
  videoConferenceLink?: string;
  videoConferencePlatform?: string;
  phoneNumber?: string;
  topics?: string;
  questionsToAsk?: string;
  candidateInstructions?: string;
}

export interface UpdateInterviewDto {
  interviewType: string;
  status: string;
  interviewerId: number;
  scheduledDateTime: string;
  durationMinutes: number;
  timezone?: string;
  actualDateTime?: string;
  actualDurationMinutes?: number;
  format: string;
  location?: string;
  meetingRoom?: string;
  videoConferenceLink?: string;
  videoConferencePlatform?: string;
  phoneNumber?: string;
  topics?: string;
  questionsToAsk?: string;
  interviewerNotes?: string;
  candidateInstructions?: string;
  overallRating?: number;
  technicalCompetency?: number;
  communicationSkills?: number;
  problemSolving?: number;
  culturalFit?: number;
  leadershipPotential?: number;
  recommendation?: string;
  evaluationSummary?: string;
  strengths?: string;
  areasOfImprovement?: string;
  cancellationReason?: string;
}

// =====================================
// JOB APPLICATION DTOs
// =====================================

export interface JobApplicationDto {
  id: number;
  applicationCode: string;
  status: string;
  applicationDate: string;
  jobPostingId: number;
  jobTitle?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  totalExperienceYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  expectedSalary?: number;
  currency: string;
  noticePeriodDays?: number;
  availableStartDate?: string;
  highestEducation?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  resumeUrl?: string;
  coverLetter?: string;
  additionalDocumentsJson?: string;
  overallRating?: number;
  technicalScore?: number;
  culturalFitScore?: number;
  evaluationNotes?: string;
  evaluatedByUserId?: number;
  evaluationDate?: string;
  source: string;
  referredByEmployeeId?: number;
  referredByEmployeeName?: string;
  sourceDetail?: string;
  currentStage: string;
  lastStageChangeDate?: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  withdrawalReason?: string;
  offerExtended: boolean;
  offerDate?: string;
  offeredSalary?: number;
  hireDate?: string;
  createdEmployeeId?: number;
  skills?: string;
  languages?: string;
  notes?: string;
  tags?: string;
  inTalentPool: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobApplicationDto {
  jobPostingId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  totalExperienceYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  expectedSalary?: number;
  currency?: string;
  noticePeriodDays?: number;
  availableStartDate?: string;
  highestEducation?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  coverLetter?: string;
  source: string;
  referredByEmployeeId?: number;
  sourceDetail?: string;
  skills?: string;
  languages?: string;
  notes?: string;
  tags?: string;
}

export interface UpdateJobApplicationDto {
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  totalExperienceYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
  availableStartDate?: string;
  highestEducation?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  coverLetter?: string;
  overallRating?: number;
  technicalScore?: number;
  culturalFitScore?: number;
  evaluationNotes?: string;
  currentStage: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  withdrawalReason?: string;
  offerExtended: boolean;
  offerDate?: string;
  offeredSalary?: number;
  hireDate?: string;
  skills?: string;
  languages?: string;
  notes?: string;
  tags?: string;
  inTalentPool: boolean;
}

// =====================================
// JOB POSTING DTOs
// =====================================

export interface JobPostingDto {
  id: number;
  title: string;
  postingCode: string;
  status: string;
  employmentType: string;
  experienceLevel: string;
  departmentId: number;
  departmentName: string;
  positionId?: number;
  positionTitle?: string;
  hiringManagerId?: number;
  hiringManagerName?: string;
  numberOfOpenings: number;
  workLocationId?: number;
  workLocationName?: string;
  remoteWorkType: string;
  city?: string;
  country?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  qualifications?: string;
  preferredQualifications?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  showSalary: boolean;
  salaryPeriod: string;
  postedDate?: string;
  applicationDeadline?: string;
  expectedStartDate?: string;
  closedDate?: string;
  totalApplications: number;
  viewsCount: number;
  hiredCount: number;
  isInternal: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  postedByUserId?: number;
  tags?: string;
  keywords?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobPostingDto {
  title: string;
  employmentType: string;
  experienceLevel: string;
  departmentId: number;
  positionId?: number;
  hiringManagerId?: number;
  numberOfOpenings: number;
  workLocationId?: number;
  remoteWorkType: string;
  city?: string;
  country?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  qualifications?: string;
  preferredQualifications?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  showSalary: boolean;
  salaryPeriod: string;
  postedDate?: string;
  applicationDeadline?: string;
  expectedStartDate?: string;
  isInternal: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  tags?: string;
  keywords?: string;
  internalNotes?: string;
}

export interface UpdateJobPostingDto {
  title: string;
  status: string;
  employmentType: string;
  experienceLevel: string;
  departmentId: number;
  positionId?: number;
  hiringManagerId?: number;
  numberOfOpenings: number;
  workLocationId?: number;
  remoteWorkType: string;
  city?: string;
  country?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  qualifications?: string;
  preferredQualifications?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  showSalary: boolean;
  salaryPeriod: string;
  applicationDeadline?: string;
  expectedStartDate?: string;
  closedDate?: string;
  isInternal: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  tags?: string;
  keywords?: string;
  internalNotes?: string;
}
