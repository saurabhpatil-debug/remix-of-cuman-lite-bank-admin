import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/tabs" });
  },
  head: () => ({
    meta: [
      { title: "Tab Management — Client Reports Hub" },
      {
        name: "description",
        content:
          "Manage report tabs and reports for the selected client in Client Reports Hub.",
      },
      { property: "og:title", content: "Tab Management — Client Reports Hub" },
      {
        property: "og:description",
        content: "Manage report tabs and reports for the selected client.",
      },
    ],
  }),
  component: () => null,
});
