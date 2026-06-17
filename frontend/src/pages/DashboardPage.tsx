import { PageShell } from "../components/layout/PageShell";
import { DashboardPageFeature } from "../features/dashboard/DashboardPage";

export function DashboardPage() {
  return <PageShell title="Dashboard"><DashboardPageFeature /></PageShell>;
}
