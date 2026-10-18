import AnalyticsManagementView from "@/components/AnalyticsManagementView";

export const metadata = {
  title: "Operations & Sales Analytics | Operations Manager | Aameena Furniture",
  description: "Workshop production funnel, stage velocity, order fulfillment, and sales graph analysis.",
};

export default function ManagerAnalysisPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AnalyticsManagementView userRole="MANAGER" />
    </div>
  );
}
