import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabForm } from "@/components/dashboard/TabForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import { addTab, isTabNameTaken } from "@/lib/store";

export const Route = createFileRoute("/dashboard/tabs/add")({
  head: () => ({
    meta: [
      { title: "Add Tab — Client Reports Hub" },
      { name: "description", content: "Create a new report tab for the selected client." },
      { property: "og:title", content: "Add Tab — Client Reports Hub" },
      {
        property: "og:description",
        content: "Create a new report tab for the selected client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TabAddPage,
});

function TabAddPage() {
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const backToList = () => navigate({ to: "/dashboard/tabs" });
  const orderOptions = Array.from({ length: tabs.length + 1 }, (_, i) => i + 1);

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tabs", to: "/dashboard/tabs" },
        { label: "Add Tab" },
      ]}
      eyebrow="Tab Management"
      title="Add Tab"
      description="Tabs group the reports for this client. Each report belongs to exactly one tab."
    >
      {clientId ? (
        <InlineFormPanel title="Add Tab" description="Give the tab a short, unique name.">
          <TabForm
            initialName=""
            orderOptions={orderOptions}
            submitLabel="Add Tab"
            onCancel={backToList}
            onSubmit={({ name, order, helpFile }) => {
              if (!clientId) return false;
              if (isTabNameTaken(clientId, name)) {
                toast.error("A tab with that name already exists");
                return false;
              }
              addTab(clientId, name, { order, helpFile });
              toast.success("Tab added");
              backToList();
              return true;
            }}
          />
        </InlineFormPanel>
      ) : ready ? (
        <NoClientNotice />
      ) : null}
    </PageScaffold>
  );
}
