import AnalyticsManagementView from "@/components/AnalyticsManagementView";

export const metadata = {
  title: "Live Sales & Graph Analytics | Super Admin ERP | Aameena Furniture",
  description: "Executive sales trajectory charts, timber demand mix, and carpentry production velocity.",
};

export default function AdminAnalysisPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AnalyticsManagementView userRole="ADMIN" />
    </div>
  );
}
