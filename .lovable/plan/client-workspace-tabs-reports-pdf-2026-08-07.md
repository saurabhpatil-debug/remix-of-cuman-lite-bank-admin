# Client Workspace: Tabs → Reports → PDF

Convert the per-client Excel/row flow into one Content Management Workspace with a split layout: Tab Management on the left, Report Management on the right. Nothing outside the client workspace is redesigned.

## 1. What exists today

```text
src/routes/
  __root.tsx                         head, fonts, Toaster
  index.tsx                          redirects to /dashboard/clients
  dashboard.tsx                      layout -> DashboardShell + Outlet
  dashboard.index.tsx                welcome
  dashboard.clients.new.tsx          create client form
  dashboard.clients.index.tsx        client list (search, pagination, Admin toggle)
  dashboard.clients.$clientId.upload.tsx                       Excel workspace
  ...sheets.$sheetName.rows.$rowId.pdf.tsx                     per-row PDF page
  ...sheets.$sheetName.rows.$rowId.powerbi.tsx                 per-row Power BI form
src/components/dashboard/            DashboardShell, DataTable, PageHeader, PowerBiSavedPopover
src/components/BrandLogo.tsx
src/lib/store.ts                     localStorage store (clients, workbooks, pdfs, powerbi)
src/lib/excel.ts                     SheetJS parsing + formatters
src/styles.css                       light cyan/red brand tokens
```

## 2. Reuse (no visual redesign)

- Layout: `dashboard.tsx` + `DashboardShell` (sidebar, header, mobile drawer) unchanged.
- `PageHeader` for the workspace header, `DataTable` for both new lists (search + pagination already built in).
- `Button`, `Input`, `Label`, `Switch`, `Dialog`, `Select`, `Popover`, `AlertDialog`, `Tabs` from `src/components/ui` — already installed, no new deps.
- `formatDate` / `formatBytes` from `src/lib/excel.ts`, `sonner` toasts, existing brand tokens.

## 3. Not touched

`src/components/ui/*`, `BrandLogo`, `DashboardShell`, `DataTable`, `PageHeader`, `styles.css`, `__root.tsx`, `index.tsx`, `dashboard.tsx`, `dashboard.index.tsx`, `dashboard.clients.new.tsx`, `src/lib/excel.ts`, favicon/assets.

## 4. New workflow

```text
Client  ──1:N──▶  Tab  ──1:N──▶  Report  ──1:1──▶  PDF
```

One route replaces the three per-row pages:
`/dashboard/clients/$clientId/workspace`

```text
┌──────────────────────── PageHeader: client name · Workspace ─────────────────────┐
│ LEFT (Tab Management)          │ RIGHT (Report Management)                       │
│ Add tab · search · list        │ Selected tab name + report count                │
│ each row: name, #reports,      │ search · Add Report                             │
│ Edit / Delete, click = select  │ table: Report, Tab, PDF, Updated, Edit/Delete   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- Left column is a card list (selected tab highlighted with the existing primary tint). On mobile the two columns stack; the tab list becomes a horizontally scrollable strip with arrow buttons (wireframe note: "tab arrows if more tabs than width of screen").
- Tab CRUD in a small dialog (name + description). Delete blocked with a toast when the tab still has reports; confirm via `AlertDialog` otherwise.
- Report dialog: **Select Tab** dropdown (defaults to the selected tab), Report Name, Workspace ID, Report ID, Embed URL, Embed Token, Dataset ID, plus **PDF upload** with the current file shown and a replace/open link. One Save persists report + PDF together.
- Right table filters to the selected tab; a "All tabs" option shows every report with its Tab column.
- Reports list supports add / update / delete / list / search — same verbs as the wireframe.

## 5. Files

Modified
- `src/lib/store.ts` — add `Tab` and `Report` types, `getTabs/addTab/updateTab/deleteTab`, `getReports/addReport/updateReport/deleteReport`, report-scoped `getPdf/savePdf`. Existing client/session/workbook helpers stay so nothing else breaks.
- `src/routes/dashboard.clients.index.tsx` — Action button becomes "Open Workspace" pointing at the new route (Admin toggle and columns unchanged).
- `src/data/clients.json` — optional: seed a couple of tabs/reports demo entries via a new seed file instead if cleaner.

New
- `src/routes/dashboard.clients.$clientId.workspace.tsx` — split-layout workspace route with its own `head()`.
- `src/components/dashboard/TabManager.tsx` — left column list + search + select + edit/delete.
- `src/components/dashboard/TabFormDialog.tsx` — add/edit tab.
- `src/components/dashboard/ReportFormDialog.tsx` — report form incl. tab select + PDF upload.
- `src/components/dashboard/ReportTable.tsx` — right column table built on `DataTable`.
- `src/data/tabs.json`, `src/data/reports.json` — seed data.

Removed (superseded by the workspace)
- `dashboard.clients.$clientId.upload.tsx`, the two `...rows.$rowId.*` routes, and `PowerBiSavedPopover.tsx`.

## 6. Technical notes

- Same localStorage store pattern; new keys `cbm.tabs`, `cbm.reports`, PDFs keyed `clientId||reportId` (base64 data URL, size-capped with a toast).
- IDs are `tab-<base36>` / `rep-<base36>`; reports carry `tabId`, so deleting a tab can be checked and reports never orphan.
- Client-side state with `useState` + effects (no backend), toasts for every create/update/delete/validation, `zod`-free inline validation matching the existing create-client form style.
- Route naming follows the dot convention already in `src/routes/`; no edits to `routeTree.gen.ts`.

## 7. Open question

The Excel upload flow is fully replaced by manual Tabs + Reports in this wireframe. If you want to keep Excel import as a way to bulk-create reports inside a tab, say so and I'll retain `excel.ts` wiring in the report dialog.
