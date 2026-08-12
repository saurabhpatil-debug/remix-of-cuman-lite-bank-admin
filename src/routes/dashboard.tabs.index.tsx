import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabManager } from "@/components/dashboard/TabManager";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTab, type Tab } from "@/lib/store";

export const Route = createFileRoute("/dashboard/tabs/")({
  head: () => ({
    meta: [
      { title: "Tab Management — CUMAN LITE" },
      {
        name: "description",
        content: "Create, rename, search and delete the report tabs that belong to each client.",
      },
      { property: "og:title", content: "Tab Management — CUMAN LITE" },
      {
        property: "og:description",
        content: "Create, rename, search and delete the report tabs that belong to each client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TabListPage,
});

function TabListPage() {
  const navigate = useNavigate();
  const { clientId, ready, tabs, reports, refresh } = useClientRecords();
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [tabToDelete, setTabToDelete] = useState<Tab | null>(null);

  return (
    <PageScaffold
      crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Tabs" }]}
      eyebrow="Tab Management"
      title="Tabs"
      description="Tabs group the reports for this client. Each report belongs to exactly one tab."
    >
      {clientId ? (
        <TabManager
          tabs={tabs}
          reports={reports}
          selectedTabId={selectedTabId}
          onSelect={setSelectedTabId}
          onAdd={() => navigate({ to: "/dashboard/tabs/add" })}
          onView={(tab) => navigate({ to: "/dashboard/tabs/$tabId", params: { tabId: tab.id } })}
          onEdit={(tab) =>
            navigate({ to: "/dashboard/tabs/$tabId/edit", params: { tabId: tab.id } })
          }
          onDelete={(tab) => setTabToDelete(tab)}
        />
      ) : ready ? (
        <NoClientNotice />
      ) : null}

      <AlertDialog open={Boolean(tabToDelete)} onOpenChange={(o) => !o && setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{tabToDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the tab from this client. Tabs that still contain reports cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!tabToDelete) return;
                const used = reports.filter((r) => r.tabId === tabToDelete.id).length;
                if (used > 0) {
                  toast.error("Tab still has reports", {
                    description: `Move or delete its ${used} report${used === 1 ? "" : "s"} first.`,
                  });
                  setTabToDelete(null);
                  return;
                }
                deleteTab(tabToDelete.id);
                setTabToDelete(null);
                setSelectedTabId(null);
                refresh();
                toast.success("Tab deleted");
              }}
            >
              Delete tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageScaffold>
  );
}
