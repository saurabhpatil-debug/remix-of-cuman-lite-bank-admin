import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useClientRecords } from "@/lib/useClientRecords";
import { TabForm } from "@/components/dashboard/TabForm";
import { InlineFormPanel } from "@/components/dashboard/InlineFormPanel";
import { NoClientNotice, PageScaffold } from "@/components/dashboard/PageScaffold";
import type { ClientTabsVM } from "@/Model/ClientTabsVM.model";
import { CreateClientTabs } from "@/Service/manageAdminTabWService";
import { isTabNameTaken } from "@/lib/store";

export default function TabAddPage() {
  const navigate = useNavigate();
  const { clientId, ready, tabs } = useClientRecords();
  const backToList = () => navigate("/dashboard/tabs");
  const orderOptions = Array.from({ length: tabs.length + 1 }, (_, i) => i + 1);

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, {
      type: blob.type || "application/pdf",
    });
  };

  return (
    <PageScaffold>
      {clientId ? (
        <InlineFormPanel title="Add Tab" description="Give the tab a short, unique name.">
          <TabForm
            initialName=""
            orderOptions={orderOptions}
            submitLabel="Save"
            onCancel={backToList}
            onSubmit={async ({ name, order, helpFile }) => {
              if (!clientId) return false;

              if (isTabNameTaken(clientId, name)) {
                toast.error("A tab with that name already exists");
                return false;
              }

              try {
                const payload: ClientTabsVM = {
                  ClientTabsId: 0,
                  ClientTabName: name.trim().toUpperCase(),
                  HelpFileURL: helpFile?.fileName ?? "",
                  PDFURL: "",
                  FileSize: helpFile ? String(helpFile.size) : "0",
                  RowVersion: "",
                };

                const pdfFile = helpFile
                  ? await dataUrlToFile(helpFile.dataUrl, helpFile.fileName)
                  : null;

                await CreateClientTabs(payload, pdfFile);
                toast.success("Tab added");
                backToList();
                return true;
              } catch (error) {
                const status =
                  typeof (error as { response?: { status?: unknown } })?.response?.status ===
                  "number"
                    ? (error as { response: { status: number } }).response.status
                    : undefined;
                const message =
                  typeof (error as { response?: { data?: { message?: unknown } } })?.response
                    ?.data?.message === "string"
                    ? (error as { response: { data: { message: string } } }).response.data
                        .message
                    : undefined;

                if (
                  status === 400 &&
                  message === "Business Access Layer: Client Tab already exists."
                ) {
                  toast.error("Client Tab already exists.");
                  return false;
                }

                toast.error("Could not add the tab", {
                  description:
                    error instanceof Error ? error.message : "Please try again.",
                });
                return false;
              }
            }}
          />
        </InlineFormPanel>
      ) : ready ? (
        <NoClientNotice />
      ) : null}
    </PageScaffold>
  );
}
