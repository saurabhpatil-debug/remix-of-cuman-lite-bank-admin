import { Navigate } from "react-router-dom";

export default function DashboardIndexPage() {
  return <Navigate to="/dashboard/tabs" replace />;
}
