# Invoice Manager Plan

## Overview
Monthly invoice tracker with file uploads, recurring invoice management, and payment tracking.

## Detailed Steps
- [x] Generate Phoenix project with SQLite
- [ ] Start server and create static mockup
- [ ] Replace home page with minimal & focused design mockup
- [ ] Create database schemas and migrations:
  - Invoice schema (name, file_path, is_recurring, tags, amount, due_date)
  - MonthlyInvoice schema (invoice_id, month, year, paid, paid_date)
- [ ] Implement simple password authentication:
  - Auth plug with env var password check
  - Session management to keep user logged in
  - Login page with password form
- [ ] Create file upload system:
  - Drag & drop file uploads
  - Auto-organize by month: `/priv/static/uploads/invoices/YYYY/MM/`
  - Auto-rename: `invoice_name_YYYY_MM.extension`
- [ ] Build Invoice List LiveView:
  - Display all invoices with file links
  - Filter by month, recurring/non-recurring
  - Add new invoice form with dropdown for recurring names
  - Tag management
- [ ] Build Recurring Management LiveView:
  - List all recurring invoice templates
  - Add/edit/delete recurring invoices
  - Set default amounts and due dates
- [ ] Build Monthly Checklist View:
  - Show all invoices due for selected month
  - Mark as paid/unpaid toggle
  - Progress indicator for month completion
- [ ] Style layouts for minimal & focused design:
  - Update app.css with clean, minimal theme
  - Update root.html.heex and Layouts.app
  - Remove theme switcher, force light theme
- [ ] Add navigation between views
- [ ] Test file uploads and authentication
- [ ] Final verification and cleanup

## Key Features
✅ Password-protected admin access
✅ Persistent login sessions  
✅ Drag & drop file uploads with auto-organization
✅ Recurring invoice templates
✅ Monthly payment tracking
✅ Simple filtering and tagging
✅ Clean, minimal design
