# cuman-bank-admin

Create a responsive Super Admin Dashboard using React, TypeScript, and Tailwind CSS. Use JSON files as static data (no Supabase or backend).

Flow:

Login page with Username and Password.

After login, open the Welcome Dashboard with a sidebar.

Sidebar menus:

Client Create (default selected)

Client List

Client Create page should display a Create Client button. Clicking it opens a form with:

Name

Username

Email

Password
Validate required fields and unique Username/Email. On submit, save to JSON and redirect to Client List.

Client List should display clients in a table with columns: Name, Username, Email, Created Date, and Action.

The Action column should have an Upload Excel button. Clicking it opens an Upload Data page for that client.

Upload an Excel (.xlsx/.xls), parse it, and display the data in dynamic tables.

If the uploaded Excel contains multiple worksheets (tabs), automatically detect all sheet names, create a separate tab for each worksheet, and display the corresponding data under its respective tab. Generate table columns dynamically from each sheet's headers.

Add an Action column for every row with two options:

Upload PDF

Configure Power BI

Store PDF uploads and Power BI configurations separately for each worksheet and each row, ensuring data is correctly mapped to the selected client, sheet, and record.

Upload PDF page should allow uploading a PDF and saving it for the selected row.

Configure Power BI page should allow entering Report Name, Workspace ID, Report ID, Embed URL, Embed Token, and Dataset ID, then save the configuration for the selected row.

Use a clean, responsive UI with a sidebar, header, searchable tables, pagination, toast notifications, and smooth page navigation. Ensure support for both single-sheet and multi-sheet Excel files.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://app-cuman-lite-admin.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e23b9c9-91d6-4403-8fb4-4a868d63e4ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
