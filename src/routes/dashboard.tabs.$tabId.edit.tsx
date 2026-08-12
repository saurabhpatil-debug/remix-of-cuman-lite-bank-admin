import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabForm } from "@/components/dashboard/TabForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import {
  NoClientNotice,
  NotFoundNotice,
  PageScaffold,
} from "@/components/dashboard/PageScaffold";
import { isTabNameTaken, updateTab } from "@/lib/store";

export const Route = createFileRoute("/dashboard/tabs/$tabId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Tab — CUMAN LITE" },
      { name: "description", content: "Rename an existing report tab for the selected client." },
      { property: "og:title", content: "Edit Tab — CUMAN LITE" },
      {
        property: "og:description",
        content: "Rename an existing report tab for the selected client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TabEditPage,
});

function TabEditPage() {
  const { tabId } = Route.useParams();
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const tab = tabs.find((t) => t.id === tabId) ?? null;
  const backToList = () => navigate({ to: "/dashboard/tabs" });
  const orderOptions = Array.from({ length: Math.max(tabs.length, 1) }, (_, i) => i + 1);

  return (
    <PageScaffold
      crumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tabs", to: "/dashboard/tabs" },
        { label: tab ? tab.name : "Tab" },
        { label: "Edit" },
      ]}
      eyebrow="Tab Management"
      title="Edit Tab"
      description="Update the tab name. Report assignments stay unchanged."
    >
      {!clientId ? (
        ready ? (
          <NoClientNotice />
        ) : null
      ) : tab ? (
        <InlineFormPanel title="Edit Tab" description="Give the tab a short, unique name.">
          <TabForm
            key={tab.id}
            initialName={tab.name}
            initialOrder={tab.order}
            initialHelpFile={tab.helpFile ?? null}
            orderOptions={orderOptions}
            submitLabel="Save changes"
            onCancel={backToList}
            onSubmit={({ name, order, helpFile }) => {
              if (isTabNameTaken(clientId, name, tab.id)) {
                toast.error("A tab with that name already exists");
                return false;
              }
              updateTab(tab.id, name, { order, helpFile });
              toast.success("Tab updated");
              backToList();
              return true;
            }}
          />
        </InlineFormPanel>
      ) : ready ? (
        <NotFoundNotice>That tab no longer exists for this client.</NotFoundNotice>
      ) : null}
    </PageScaffold>
  );
}
