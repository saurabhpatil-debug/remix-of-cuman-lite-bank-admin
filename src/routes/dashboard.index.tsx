import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CUMAN LITE" },
      {
        name: "description",
        content: "Manage tabs and reports for the selected client in CUMAN LITE.",
      },
      { property: "og:title", content: "Dashboard — CUMAN LITE" },
      {
        property: "og:description",
        content: "Manage tabs and reports for the selected client in CUMAN LITE.",
      },
    ],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  return <Navigate to="/dashboard/tabs" />;
}
