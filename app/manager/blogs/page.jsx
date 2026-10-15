import BlogManagementView from "@/components/BlogManagementView";

export const metadata = {
  title: "Manager Blog Articles Desk | Aameena Furniture",
  description: "Publish workshop updates, timber guides, and showroom announcements.",
};

export default function ManagerBlogsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <BlogManagementView userRole="MANAGER" />
    </div>
  );
}
