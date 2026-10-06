import PricingManagementView from "@/components/PricingManagementView";

export const metadata = {
  title: "Pricing & PDF Catalog Management | Admin Aameena Furniture",
  description:
    "Manage turnkey furnishing packages, 3-tier models (Budget, Simple, Premium), and upload respective PDF rate cards.",
};

export default function AdminPricingPage() {
  return <PricingManagementView userRole="ADMIN" />;
}
