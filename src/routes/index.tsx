import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/tabs" });
  },
  head: () => ({
    meta: [
      { title: "Tab Management — CUMAN LITE" },
      {
        name: "description",
        content:
          "Manage report tabs and reports for the selected client in CUMAN LITE.",
      },
      { property: "og:title", content: "Tab Management — CUMAN LITE" },
      {
        property: "og:description",
        content: "Manage report tabs and reports for the selected client.",
      },
    ],
  }),
  component: () => null,
});
