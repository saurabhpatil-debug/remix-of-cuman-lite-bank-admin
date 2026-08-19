import { Link, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/routes/dashboard";
import DashboardIndexPage from "@/routes/dashboard.index";
import IndexPage from "@/routes/index";
import ReportEditPage from "@/routes/dashboard.reports.$reportId.edit";
import ReportViewPage from "@/routes/dashboard.reports.$reportId.index";
import ReportAddPage from "@/routes/dashboard.reports.add";
import ReportListPage from "@/routes/dashboard.reports.index";
import TabEditPage from "@/routes/dashboard.tabs.$tabId.edit";
import TabViewPage from "@/routes/dashboard.tabs.$tabId.index";
import TabAddPage from "@/routes/dashboard.tabs.add";
import TabListPage from "@/routes/dashboard.tabs.index";
import { UserProvider } from "./framework/UserContext";
import { setupResponseInterceptor } from "./framework/InterceptedHttp/responseInterceptor";

setupResponseInterceptor();

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
    <Routes>
      <Route path="/" element={<IndexPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardIndexPage />} />

        <Route path="tabs" element={<TabListPage />} />
        <Route path="tabs/add" element={<TabAddPage />} />
        <Route path="tabs/:tabId" element={<TabViewPage />} />
        <Route path="tabs/:tabId/edit" element={<TabEditPage />} />

        <Route path="reports" element={<ReportListPage />} />
        <Route path="reports/add" element={<ReportAddPage />} />
        <Route path="reports/:reportId" element={<ReportViewPage />} />
        <Route path="reports/:reportId/edit" element={<ReportEditPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </UserProvider>
  );
}