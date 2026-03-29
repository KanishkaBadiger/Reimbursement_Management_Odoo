# Reimbursement Management App

This plan encompasses building a full Reimbursement Management Web App, adhering to the strict "Professional Light Theme (Enterprise Ready)" design guidelines provided.

## User Feedback Addressed
- **Receipt Upload with OCR Sync:** Added fake 1.5s loading OCR simulation which autofills Amount & Description.
- **Approval Sequence:** Added `approvalSteps` array to track the status uniquely.
- **Currency Sync:** Will add `displayAmount` directly storing the INR converted value for seamless calculations for Manager and Admin.
- **Stitch:** We will use Stitch MCP to generate the UI components based on the design rules provided.

## Proposed Changes

We will use Stitch MCP to generate the user interface screens:
1. `EmployeeView`
2. `ManagerView`
3. `AdminView`

### Stitch Project Creation
We will create a Stitch Project and apply a design system that adheres to strict color guidelines.

---

### `src/App.jsx`

This will be the single JSX file containing the entire application with default export. 

It will include:
1. **Google Fonts `<style>` injection**: Playfair Display & DM Sans.
2. **State Management**:
   - `activeRole`: Employee | Manager | Admin
   - `employees`: 5 seeded Indian employees.
   - `expenses`: Seeded expenses with base currency, `displayAmount` (converted to INR), and `approvalSteps` for sequential multi-level approvals.
   - `rules`: Seeded approval rules for the Admin panel.
3. **Components (Internal to the file)**:
   - `Tabs`: Role switcher (Employee, Manager, Admin).
   - `StatCard`: Resuable stats component.
   - `Badge`: Reusable status badge component.
   - `EmployeeView`: Submission form with Receipt Upload (OCR simulation) and personal expense list.
   - `ManagerView`: Pending approvals list with actions, receipt viewing, and recent decisions.
   - `AdminView`: Rules manager, Users table, and Audit table.
4. **Styling**: Strict adherence to the provided 'Enterprise Ready' palette:
   - Base Colors: Background `#F8FAFC`, Card/Surface `#FFFFFF`, Border/Divider `#E5E7EB`
   - Primary Brand: Primary `#2563EB`, Hover `#1D4ED8`, Light `#DBEAFE`
   - Text Colors: Primary `#111827`, Secondary `#6B7280`, Muted `#9CA3AF`
   - Status Colors: Approved (Green `#16A34A` text, `#DCFCE7` bg), Pending (Yellow `#D97706` text, `#FEF3C7` bg), Rejected (Red `#DC2626` text, `#FEE2E2` bg)
   - Sidebar: Light `#FFFFFF`, Active `#EFF6FF`, Hover `#F1F5F9`
   - Buttons: Primary (Blue), Secondary (White w/ border), Danger (Red)
   - Use soft shadows `box-shadow: 0 1px 2px rgba(0,0,0,0.05);` everywhere instead of hard borders.

## Verification Plan

### Automated/Manual Verification
- Run `npm run dev` to start the local development server.
- Verify the font imports, color palette, and absence of shadows.
- Test the expense submission as an Employee with a fake file upload that triggers the OCR simulation.
- Verify that Manager/Admin dashboards reflect the `displayAmount` correctly.
- Switch to Manager view to approve/reject the expense, ensuring the `approvalSteps` updates properly instead of flat status updates.
- Switch to the Admin view to verify the audit table reflects the changes.
