import DashboardLayout from "@/components/layout/dashboard-layout";
import LovableThreatPage from "@/components/lovable/lovable-threat-page";

export const metadata = {
  title: "Lovable · CPAR · Astan",
};

export default function LovablePage() {
  return (
    <DashboardLayout hideHeader>
      <LovableThreatPage />
    </DashboardLayout>
  );
}
