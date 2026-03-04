export enum UserRole {
  PRESIDENT = 'president',
  SECRETARY = 'secretary',
  TREASURER = 'treasurer',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export enum EventType {
  MEETING = 'meeting',
}

export enum EventPriority {
  NORMAL = 'normal',
  EMERGENCY = 'emergency',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EvidenceType {
  PHOTO = 'photo',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum EvidenceCategory {
  EVIDENCE = 'evidence',
  INCIDENT = 'incident',
  VOUCHER = 'voucher',
}

export enum NotificationType {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  INCIDENT_REPORTED = 'incident_reported',
  VOUCHER_UPLOADED = 'voucher_uploaded',
}
