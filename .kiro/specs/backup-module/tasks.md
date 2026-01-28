# Implementation Plan: Backup Module

## Overview

This implementation plan breaks down the Backup Module into discrete, actionable tasks following the approved requirements and design. The module provides comprehensive database backup and restore capabilities for SISGERP, including manual and scheduled backups, backup management, restoration, and automatic retention policies.

The implementation follows the established SISGERP architecture with Next.js App Router, React 19, TypeScript, and Supabase. Tasks are organized to build incrementally, with early validation through testing.

## Tasks

- [x] 1. Database schema and migrations
  - Create database tables for backups, backup_schedules, and restore_jobs
  - Add indexes for performance optimization
  - Set up foreign key constraints and RLS policies
  - _Requirements: 1.4, 1.7, 2.1, 5.6, 9.7_

- [ ] 2. Core type definitions and validation schemas
  - [x] 2.1 Create TypeScript types in `src/server/backup/models/types.ts`
    - Define Backup, BackupSchedule, RestoreJob, BackupMetadata interfaces
    - Define CreateBackupOptions, BackupFilters, CreateScheduleInput types
    - Define TableInfo, BackupData, TableData, ValidationResult types
    - _Requirements: 1.2, 1.3, 1.7, 2.1, 3.1, 5.1, 15.2_

  - [x] 2.2 Create Zod validation schemas in `src/server/backup/models/validation.ts`
    - Implement createBackupSchema with type and tables validation
    - Implement backupFiltersSchema for date range and status filters
    - Implement createScheduleSchema and updateScheduleSchema
    - _Requirements: 1.3, 2.1, 3.3, 3.4, 3.5, 12.4_

  - [ ]* 2.3 Write property test for validation schemas
    - **Property 9: Schedule Configuration Validation**
    - **Validates: Requirements 2.1, 12.4**

- [ ] 3. Utility modules for compression and formatting
  - [x] 3.1 Create compression utilities in `src/server/backup/utils/compression.ts`
    - Implement gzip compression function for backup data
    - Implement gzip decompression function for restore
    - Handle compression errors gracefully
    - _Requirements: 1.8, 15.4_

  - [ ]* 3.2 Write property test for compression utilities
    - **Property 6: Compression Effectiveness**
    - **Property 37: Gzip Compression Format**
    - **Validates: Requirements 1.8, 15.4**

  - [x] 3.3 Create formatting utilities in `src/server/backup/utils/format.ts`
    - Implement formatFileSize function for human-readable sizes (KB, MB, GB, TB)
    - Implement date formatting functions
    - _Requirements: 3.7_

  - [ ]* 3.4 Write property test for file size formatting
    - **Property 17: Human-Readable Size Formatting**
    - **Validates: Requirements 3.7**

- [x] 4. Storage service for Supabase Storage operations
  - [x] 4.1 Implement StorageService in `src/server/backup/services/storageService.ts`
    - Implement uploadBackup method to store compressed files
    - Implement downloadBackup method to retrieve files
    - Implement deleteBackup method to remove files
    - Implement getDownloadUrl method for signed URLs
    - Implement fileExists method to check file presence
    - Handle storage errors and return appropriate error messages
    - _Requirements: 1.5, 4.2, 4.3, 4.4, 5.3, 6.2_

  - [ ]* 4.2 Write unit tests for StorageService
    - Test successful upload, download, delete operations
    - Test error handling for missing files
    - Test signed URL generation
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 4.3 Write property test for storage operations
    - **Property 18: Download URL Generation**
    - **Property 19: Missing File Error Handling**
    - **Validates: Requirements 4.3, 4.4**

- [x] 5. Backup service for backup creation and management
  - [x] 5.1 Implement BackupService in `src/server/backup/services/backupService.ts`
    - Implement createBackup method with role validation
    - Implement exportTables method to extract data from PostgreSQL
    - Implement validateBackup method for integrity checks
    - Implement getBackupMetadata method
    - Implement listBackups method with filtering support
    - Handle backup status transitions (pending → in_progress → completed/failed)
    - Generate backup metadata with format version and table schemas
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 8.3, 8.4, 8.6, 15.1, 15.2, 15.5_

  - [ ]* 5.2 Write property test for role-based access control
    - **Property 1: Role-Based Access Control**
    - **Validates: Requirements 1.1, 9.1, 9.5**

  - [ ]* 5.3 Write property test for full backup completeness
    - **Property 3: Full Backup Completeness**
    - **Validates: Requirements 1.2**

  - [ ]* 5.4 Write property test for selective backup accuracy
    - **Property 4: Selective Backup Accuracy**
    - **Validates: Requirements 1.3**

  - [ ]* 5.5 Write property test for backup metadata completeness
    - **Property 5: Backup Metadata Completeness**
    - **Validates: Requirements 1.7, 3.2, 15.2, 15.5**

  - [ ]* 5.6 Write property test for backup status state machine
    - **Property 7: Backup Status State Machine**
    - **Validates: Requirements 1.4, 1.5, 1.6, 6.3**

  - [ ]* 5.7 Write property test for backup failure error logging
    - **Property 8: Backup Failure Error Logging**
    - **Validates: Requirements 1.6**

  - [ ]* 5.8 Write property test for filtering operations
    - **Property 14: Date Range Filtering**
    - **Property 15: Type and Status Filtering**
    - **Property 16: Default Sort Order**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**

  - [ ]* 5.9 Write property test for backup validation integrity
    - **Property 29: Backup Validation Integrity**
    - **Property 30: Validation Success Timestamp**
    - **Property 31: Validation Failure Corruption Marking**
    - **Property 32: Automatic Post-Creation Validation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

  - [ ]* 5.10 Write property test for JSON data format
    - **Property 35: JSON Data Format**
    - **Validates: Requirements 15.1**

- [x] 6. Restore service for backup restoration
  - [x] 6.1 Implement RestoreService in `src/server/backup/services/restoreService.ts`
    - Implement restoreBackup method with role validation and confirmation
    - Implement importTables method with transaction support
    - Implement validateRestore method for compatibility checks
    - Handle restore status transitions (in_progress → completed/failed)
    - Implement rollback on failure
    - Support both full and selective restoration
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 15.6_

  - [ ]* 6.2 Write property test for restore status state machine
    - **Property 20: Restore Status State Machine**
    - **Validates: Requirements 5.6, 5.7, 5.8**

  - [ ]* 6.3 Write property test for full restore completeness
    - **Property 21: Full Restore Completeness**
    - **Validates: Requirements 5.4**

  - [ ]* 6.4 Write property test for selective restore accuracy
    - **Property 22: Selective Restore Accuracy**
    - **Validates: Requirements 5.5**

  - [ ]* 6.5 Write property test for restore transaction rollback
    - **Property 23: Restore Transaction Rollback**
    - **Validates: Requirements 5.8**

  - [ ]* 6.6 Write property test for data type preservation (round-trip)
    - **Property 36: Data Type Preservation (Round-Trip)**
    - **Validates: Requirements 15.3**

  - [ ]* 6.7 Write property test for format version compatibility
    - **Property 38: Format Version Compatibility**
    - **Validates: Requirements 15.6**

- [x] 7. Schedule service for automatic backups
  - [x] 7.1 Implement ScheduleService in `src/server/backup/services/scheduleService.ts`
    - Implement createSchedule method with validation
    - Implement updateSchedule method
    - Implement deleteSchedule method
    - Implement getDueSchedules method to find schedules ready to run
    - Implement executeSchedule method to trigger scheduled backups
    - Implement listSchedules method
    - Calculate next_run_at based on frequency
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 7.2 Write property test for schedule execution fidelity
    - **Property 10: Schedule Execution Fidelity**
    - **Validates: Requirements 2.3**

  - [ ]* 7.3 Write property test for disabled schedule exclusion
    - **Property 11: Disabled Schedule Exclusion**
    - **Validates: Requirements 2.5**

  - [ ]* 7.4 Write property test for scheduled backup history
    - **Property 12: Scheduled Backup History**
    - **Validates: Requirements 2.4**

  - [ ]* 7.5 Write property test for multiple schedules support
    - **Property 13: Multiple Schedules Support**
    - **Validates: Requirements 2.6**

- [x] 8. Retention service for automatic cleanup
  - [x] 8.1 Implement RetentionService in `src/server/backup/services/retentionService.ts`
    - Implement applyRetentionPolicy method
    - Implement getExpiredBackups method with retention period calculation
    - Implement deleteExpiredBackups method
    - Support different retention periods for full vs selective backups
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 8.2 Write property test for retention policy identification
    - **Property 26: Retention Policy Identification**
    - **Validates: Requirements 7.2**

  - [ ]* 8.3 Write property test for automatic retention deletion
    - **Property 27: Automatic Retention Deletion**
    - **Validates: Requirements 7.3**

  - [ ]* 8.4 Write property test for differential retention periods
    - **Property 28: Differential Retention Periods**
    - **Validates: Requirements 7.6**

- [x] 9. Checkpoint - Core services complete
  - Ensure all service tests pass
  - Verify service integration works correctly
  - Ask the user if questions arise

- [x] 10. Backup controller for request handling
  - [x] 10.1 Implement BackupController in `src/server/backup/controllers/backupController.ts`
    - Implement handleListBackups with organization scoping
    - Implement handleCreateBackup with authorization
    - Implement handleGetBackup with organization validation
    - Implement handleDeleteBackup with authorization
    - Implement handleRestoreBackup with authorization
    - Implement handleDownloadBackup with authorization
    - Implement handleGetAvailableTables
    - Add audit logging for all operations
    - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 10.2 Write property test for multi-tenant data isolation
    - **Property 2: Multi-Tenant Data Isolation**
    - **Validates: Requirements 3.1, 9.7**

  - [ ]* 10.3 Write property test for read access for all users
    - **Property 33: Read Access for All Users**
    - **Validates: Requirements 9.6**

  - [ ]* 10.4 Write property test for comprehensive audit logging
    - **Property 34: Comprehensive Audit Logging**
    - **Validates: Requirements 4.5, 5.9, 6.5, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.7**

- [x] 11. Schedule controller for schedule management
  - [x] 11.1 Implement ScheduleController in `src/server/backup/controllers/scheduleController.ts`
    - Implement handleListSchedules with organization scoping
    - Implement handleCreateSchedule with authorization
    - Implement handleUpdateSchedule with authorization
    - Implement handleDeleteSchedule with authorization
    - Add audit logging for schedule operations
    - _Requirements: 2.1, 2.5, 9.1, 10.5_

  - [ ]* 11.2 Write unit tests for ScheduleController
    - Test authorization checks
    - Test organization scoping
    - Test audit logging
    - _Requirements: 2.1, 9.1, 10.5_

- [x] 12. API routes for backup operations
  - [x] 12.1 Create GET/POST `/api/backup/route.ts`
    - GET: List backups with filters (calls handleListBackups)
    - POST: Create new backup (calls handleCreateBackup)
    - Extract user session and organization from request
    - Handle errors and return appropriate HTTP status codes
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3, 3.4, 3.5_

  - [x] 12.2 Create GET/DELETE `/api/backup/[id]/route.ts`
    - GET: Get backup details (calls handleGetBackup)
    - DELETE: Delete backup (calls handleDeleteBackup)
    - Validate backup ID parameter
    - _Requirements: 3.1, 6.1, 6.2_

  - [x] 12.3 Create POST `/api/backup/[id]/restore/route.ts`
    - POST: Restore from backup (calls handleRestoreBackup)
    - Validate confirmation in request body
    - _Requirements: 5.1, 5.2_

  - [x] 12.4 Create GET `/api/backup/[id]/download/route.ts`
    - GET: Generate download URL (calls handleDownloadBackup)
    - Return signed URL with expiration
    - _Requirements: 4.1, 4.3_

  - [x] 12.5 Create GET `/api/backup/tables/route.ts`
    - GET: List available tables for backup (calls handleGetAvailableTables)
    - Return table info with display names and row counts
    - _Requirements: 12.3_

  - [ ]* 12.6 Write integration tests for backup API routes
    - Test successful backup creation and listing
    - Test authorization failures
    - Test error handling
    - _Requirements: 1.1, 3.1, 9.1_

- [x] 13. API routes for schedule operations
  - [x] 13.1 Create GET/POST/PUT/DELETE `/api/backup/schedules/route.ts`
    - GET: List schedules (calls handleListSchedules)
    - POST: Create schedule (calls handleCreateSchedule)
    - PUT: Update schedule (calls handleUpdateSchedule)
    - DELETE: Delete schedule (calls handleDeleteSchedule)
    - Extract user session and organization from request
    - _Requirements: 2.1, 2.5_

  - [ ]* 13.2 Write integration tests for schedule API routes
    - Test schedule CRUD operations
    - Test authorization checks
    - _Requirements: 2.1, 9.1_

- [x] 14. Checkpoint - API layer complete
  - Ensure all API routes work correctly
  - Test end-to-end flows from API to services
  - Ask the user if questions arise

- [x] 15. Frontend types and API client
  - [x] 15.1 Create frontend types in `src/features/backup/types.ts`
    - Mirror server types for frontend use
    - Add UI-specific types (loading states, dialog states)
    - _Requirements: 11.1, 11.2, 12.1, 13.1_

  - [x] 15.2 Implement API client functions in `src/features/backup/api.ts`
    - Implement listBackups with filter support
    - Implement createBackup
    - Implement getBackup
    - Implement deleteBackup
    - Implement restoreBackup
    - Implement downloadBackup
    - Implement listSchedules, createSchedule, updateSchedule, deleteSchedule
    - Implement getAvailableTables
    - Include auth token in all requests
    - Handle API errors and return user-friendly messages
    - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 2.1_

  - [ ]* 15.3 Write unit tests for API client functions
    - Test request formatting
    - Test error handling
    - Test auth token inclusion
    - _Requirements: 1.1, 3.1_

- [x] 16. Backup table component
  - [x] 16.1 Create BackupTable component in `src/features/backup/components/BackupTable.tsx`
    - Use TanStack Table for data display
    - Display columns: date, type, size, status, creator, actions
    - Implement action buttons (download, restore, delete) based on user role
    - Show loading states during operations
    - Format file sizes using formatFileSize utility
    - Format dates in Brazilian Portuguese format
    - _Requirements: 3.7, 11.2, 11.7, 11.8_

  - [ ]* 16.2 Write unit tests for BackupTable
    - Test column rendering
    - Test action button visibility based on role
    - Test loading states
    - _Requirements: 11.2, 11.7_

- [x] 17. Create backup dialog component
  - [x] 17.1 Create CreateBackupDialog in `src/features/backup/components/CreateBackupDialog.tsx`
    - Use shadcn/ui Dialog component
    - Implement radio buttons for full/selective backup type
    - Show table selection checkboxes for selective backups
    - Validate at least one table selected for selective backups
    - Show loading state during backup creation
    - Display success/error notifications
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 17.2 Write unit tests for CreateBackupDialog
    - Test form validation
    - Test table selection logic
    - Test submission handling
    - _Requirements: 12.4, 12.5_

- [x] 18. Restore confirmation dialog component
  - [x] 18.1 Create RestoreConfirmDialog in `src/features/backup/components/RestoreConfirmDialog.tsx`
    - Use shadcn/ui Dialog component
    - Display warning about data being overwritten
    - Show backup details (date, type, tables)
    - Require user to type confirmation phrase "RESTAURAR"
    - Disable restore button until correct phrase is entered
    - Show progress indicator during restore
    - Display success/error notifications
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [ ]* 18.2 Write unit tests for RestoreConfirmDialog
    - Test confirmation phrase validation
    - Test button enable/disable logic
    - Test warning display
    - _Requirements: 13.4, 13.5_

- [x] 19. Schedule management components
  - [x] 19.1 Create ScheduleList component in `src/features/backup/components/ScheduleList.tsx`
    - Display list of backup schedules
    - Show schedule details (name, frequency, type, last run, next run)
    - Provide enable/disable toggle
    - Provide edit and delete actions
    - _Requirements: 2.1, 2.5_

  - [x] 19.2 Create ScheduleDialog component in `src/features/backup/components/ScheduleDialog.tsx`
    - Form for creating/editing schedules
    - Fields: name, frequency, backup type, tables, retention days
    - Validate schedule configuration
    - _Requirements: 2.1_

  - [ ]* 19.3 Write unit tests for schedule components
    - Test schedule display
    - Test form validation
    - Test enable/disable toggle
    - _Requirements: 2.1, 2.5_

- [x] 20. Main backup page client component
  - [x] 20.1 Create BackupPageClient in `src/features/backup/BackupPageClient.tsx`
    - Implement state management for backups, filters, dialogs
    - Implement handleCreateBackup to open dialog and create backup
    - Implement handleRestoreBackup to open confirmation and restore
    - Implement handleDeleteBackup with confirmation
    - Implement handleDownloadBackup to trigger download
    - Implement handleFilterChange to update filters and refetch
    - Implement refreshBackups to reload backup list
    - Show loading indicators during operations
    - Display success/error toast notifications
    - Integrate BackupTable, CreateBackupDialog, RestoreConfirmDialog
    - Add filter controls (date range, type, status)
    - Add "Create Backup" button (admin/superadmin only)
    - Display empty state when no backups exist
    - _Requirements: 11.1, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [ ]* 20.2 Write integration tests for BackupPageClient
    - Test backup creation flow
    - Test restore flow with confirmation
    - Test delete flow
    - Test filter application
    - Test role-based button visibility
    - _Requirements: 11.1, 11.7, 12.1, 13.1_

- [x] 21. Server page component and route
  - [x] 21.1 Create backup page in `src/app/(app)/backup/page.tsx`
    - Server component that fetches initial backup list
    - Extract user session and organization
    - Pass initial data and user role to BackupPageClient
    - Handle authentication redirect
    - _Requirements: 11.1_

  - [x] 21.2 Add backup route to navigation
    - Update navigation menu to include "Backups" link
    - Restrict visibility to admin/superadmin roles
    - _Requirements: 9.1_

- [x] 22. Scheduled job runner (optional background service)
  - [x] 22.1 Create cron job or scheduled task for backup execution
    - Call ScheduleService.getDueSchedules()
    - Execute each due schedule
    - Update last_run_at and next_run_at
    - Log execution results
    - _Requirements: 2.2, 2.4_

  - [x] 22.2 Create cron job for retention policy enforcement
    - Call RetentionService.applyRetentionPolicy() daily
    - Log deleted backups
    - _Requirements: 7.4_

- [x] 23. Database migration file
  - [x] 23.1 Create migration in `supabase/migrations/`
    - Create backups table with all columns and constraints
    - Create backup_schedules table
    - Create restore_jobs table
    - Add indexes for performance
    - Set up RLS policies for multi-tenant isolation
    - _Requirements: 1.4, 1.7, 2.1, 5.6, 9.7_

  - [x] 23.2 Apply migration to development database
    - Run migration using Supabase CLI
    - Verify tables and policies are created correctly
    - _Requirements: 1.4_

- [x] 24. Final checkpoint - Integration and testing
  - [x] 24.1 Test complete backup creation flow
    - Create full backup via UI
    - Create selective backup via UI
    - Verify files are stored in Supabase Storage
    - Verify backup records in database
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 24.2 Test complete restore flow
    - Restore from full backup
    - Restore from selective backup
    - Verify data is restored correctly
    - Verify audit logs are created
    - _Requirements: 5.1, 5.4, 5.5, 5.9_

  - [x] 24.3 Test schedule functionality
    - Create backup schedule
    - Manually trigger schedule execution
    - Verify scheduled backup is created
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 24.4 Test retention policy
    - Create old backups (manually set dates)
    - Run retention service
    - Verify old backups are deleted
    - _Requirements: 7.2, 7.3_

  - [x] 24.5 Test authorization and multi-tenancy
    - Verify users can only see their organization's backups
    - Verify role-based access control works
    - Verify audit logging captures all operations
    - _Requirements: 9.1, 9.6, 9.7, 10.1_

  - [x] 24.6 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Execute all integration tests
    - Verify coverage meets 80% threshold
    - _Requirements: All_

- [x] 25. Documentation and cleanup
  - [x] 25.1 Add README to backup feature directory
    - Document API client functions
    - Document component usage
    - Document service architecture
    - _Requirements: All_

  - [x] 25.2 Add inline code documentation
    - Add JSDoc comments to public functions
    - Document complex algorithms
    - Add usage examples
    - _Requirements: All_

  - [x] 25.3 Update main project documentation
    - Add backup module to feature list
    - Document backup/restore procedures
    - Document schedule configuration
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate end-to-end flows
- The implementation follows SISGERP's established patterns (feature modules, API routes, server services)
- All UI text should be in Brazilian Portuguese
- All operations must respect multi-tenant isolation and RBAC
- Audit logging is required for all sensitive operations
