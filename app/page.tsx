import DashboardLayout from "@/components/layout/dashboard-layout";
import CparDemoPage from "@/components/demo/cpar-demo-page";

export const metadata = {
  title: "CPAR · Astan",
  description: "Cross-Platform Abuse Reporting — live",
};

export default function Page() {
  return (
    <DashboardLayout hideHeader>
      <CparDemoPage />
    </DashboardLayout>
  );
}
