import DashboardLayout from "@/components/layout/dashboard-layout";
import IncidentDetail from "@/components/demo/incident-detail";

export default function IncidentPage() {
  return (
    <DashboardLayout hideHeader>
      <IncidentDetail />
    </DashboardLayout>
  );
}
