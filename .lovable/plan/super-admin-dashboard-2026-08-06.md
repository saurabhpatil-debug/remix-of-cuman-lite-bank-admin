# Super Admin Dashboard

A responsive admin console for managing clients and their Excel-driven data, with per-row PDF uploads and Power BI configuration. All data lives in seed JSON files plus browser storage — no backend.

## Flow

1. **Login** (`/`) — Username + Password. Admin credentials come from a seed JSON file; clients created in the dashboard can also log in. Invalid credentials show a toast error.
2. **Dashboard** (`/dashboard`) — Welcome screen with header (app title, logged-in user, logout) and a collapsible sidebar.
3. **Sidebar** — Client Create (default selected) and Client List.
4. **Client Create** (`/dashboard/clients/new`) — A "Create Client" button reveals the form: Name, Username, Email, Password. Required-field validation plus unique Username/Email checks. On success the client is saved and the app redirects to Client List with a success toast.
5. **Client List** (`/dashboard/clients`) — Searchable, paginated table: Name, Username, Email, Created Date, Action. Action holds an "Upload Excel" button.
6. **Upload Data** (`/dashboard/clients/$clientId/upload`) — Client-scoped page to upload an `.xlsx`/`.xls` file. Every worksheet becomes its own tab; each tab renders a table with columns generated from that sheet's header row, plus search and pagination. Each row gets an Action column with "Upload PDF" and "Configure Power BI".
7. **Upload PDF** (`/dashboard/clients/$clientId/sheets/$sheetName/rows/$rowId/pdf`) — Upload a PDF for that exact row; shows the currently saved file with a preview/open link and allows replacing it.
8. **Configure Power BI** (`/dashboard/clients/$clientId/sheets/$sheetName/rows/$rowId/powerbi`) — Form for Report Name, Workspace ID, Report ID, Embed URL, Embed Token, Dataset ID. Saving stores the config for that row and returns to the Upload Data page.

Every PDF and Power BI record is keyed by client + sheet name + row id, so nothing leaks between clients or worksheets.

## Data & persistence

- Seed files `src/data/users.json` and `src/data/clients.json` provide the initial admin user and any demo clients.
- On first load the seed is copied into `localStorage`; afterwards all reads/writes go through a small store module so created clients, parsed sheets, PDFs, and Power BI configs survive refresh.
- PDFs are stored as base64 data URLs so they can be previewed in-browser; oversized files are rejected with a clear toast.

## Design

Dark slate console with a single accent color, one distinctive display font for headings paired with a clean sans for body text. Cards with subtle borders, dense data tables, sticky table headers, tab bar for worksheets. Sidebar collapses to an icon rail and becomes an off-canvas drawer on mobile; tables scroll horizontally on small screens. Toasts via sonner for all create/save/validation feedback.

## Technical notes

- Routes are TanStack Start file routes under `src/routes/`; the login page replaces the placeholder `src/routes/index.tsx`. Authenticated pages sit under a `dashboard` layout route that renders the sidebar/header shell around `<Outlet />` and redirects to `/` when no session is present.
- Excel parsing uses the `xlsx` package (`SheetJS`) client-side: `read` the ArrayBuffer, iterate `workbook.SheetNames`, and `sheet_to_json` each sheet with header detection. Rows are assigned stable synthetic ids on import so PDF/Power BI records stay mapped after re-render.
- Session (logged-in user) kept in a React context backed by localStorage; forms validated with `zod` + inline error messages.
- Design tokens added to `src/styles.css` under `@theme inline`; fonts loaded via `<link>` in `__root.tsx`. Each route defines its own `head()` metadata.
- Shared UI pieces: `DataTable` (search + pagination), `AppSidebar`, `AppHeader`, `SheetTabs`.
