# Client Reports Hub

A responsive admin dashboard for managing clients, report tabs, Power BI configurations, and PDF attachments.

Built with React, TypeScript, Vite, React Router DOM, and Tailwind CSS.

## Features

- **Login**: Username + password authentication for admin and client users.
- **Client context**: Works standalone or hand-in-hand with a client portal via `?clientId=` query parameters.
- **Tab Management**: Create, rename, search, and delete report tabs per client.
- **Report Management**: Add reports with Power BI details (Workspace ID, Report ID, Embed URL, Embed Token, Dataset ID) and optional PDF attachments.
- **Responsive UI**: Sidebar navigation, searchable data tables, pagination, toast notifications, and mobile-friendly layouts.

## Data & persistence

- Seed data lives in `src/data/` as static JSON.
- On first load, seed data is copied to `localStorage` and IndexedDB (for PDF blobs); subsequent reads and writes go through the browser store so changes survive refresh.
- Ready to migrate to Lovable Cloud if you need multi-user, persistent backend storage.

## Development

Prefer working locally? You need Node.js and a package manager such as `npm` or `bun`.

```sh
git clone <this-repository-url>
cd client-reports-hub
npm i
npm run dev
```

This project was built with [Lovable](https://lovable.dev).
