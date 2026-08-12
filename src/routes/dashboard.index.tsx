import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Client Reports Hub" },
      {
        name: "description",
        content: "Manage tabs and reports for the selected client in Client Reports Hub.",
      },
      { property: "og:title", content: "Dashboard — Client Reports Hub" },
      {
        property: "og:description",
        content: "Manage tabs and reports for the selected client in Client Reports Hub.",
      },
    ],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  return <Navigate to="/dashboard/tabs" />;
}
