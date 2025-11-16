export enum ReminderType {
  General = 0,
  Task = 1,
  Meeting = 2,
  FollowUp = 3,
  Birthday = 4,
  ContractRenewal = 5,
  PaymentDue = 6,
}

export enum ReminderStatus {
  Pending = 0,
  Snoozed = 1,
  Triggered = 2,
  Completed = 3,
  Dismissed = 4,
}

export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4,
}

export interface RecurrencePattern {
  // For weekly: array of weekday numbers (0 = Sunday, 6 = Saturday)
  weekDays?: number[];
  // For monthly: day of month (1-31)
  dayOfMonth?: number;
  // Interval (e.g., every 2 weeks, every 3 months)
  interval?: number;
}

export interface Reminder {
  id: number;
  tenantId: string;
  userId: string;
  title: string;
  description?: string;
  remindAt: string; // ISO date string
  type: ReminderType;
  status: ReminderStatus;
  relatedEntityId?: number;
  relatedEntityType?: string;
  completedAt?: string;
  snoozedUntil?: string;
  sendEmail: boolean;
  sendPush: boolean;
  sendInApp: boolean;
  recurrenceType: RecurrenceType;
  recurrencePattern?: string; // JSON string of RecurrencePattern
  recurrenceEndDate?: string;
  assignedToUserId?: string;
  dueDate?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  participants?: string; // JSON string of user IDs array
  createdDate: string;
}

export interface CreateReminderRequest {
  title: string;
  remindAt: string;
  type: ReminderType;
  description?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendInApp?: boolean;
  recurrenceType?: RecurrenceType;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  assignedToUserId?: string;
  dueDate?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  participants?: string;
}

export interface UpdateReminderRequest {
  title: string;
  remindAt: string;
  type: ReminderType;
  description?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendInApp?: boolean;
  recurrenceType?: RecurrenceType;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  assignedToUserId?: string;
  dueDate?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  participants?: string;
}

export interface GetRemindersResponse {
  reminders: Reminder[];
  totalCount: number;
}

export interface SnoozeReminderRequest {
  minutes: number;
}
