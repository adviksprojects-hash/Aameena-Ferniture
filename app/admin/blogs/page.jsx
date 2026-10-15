import BlogManagementView from "@/components/BlogManagementView";

export const metadata = {
  title: "Admin Blog & SEO Article Management | Aameena Furniture",
  description: "Create, edit, and moderate educational woodcraft and product articles.",
};

export default function AdminBlogsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <BlogManagementView userRole="ADMIN" />
    </div>
  );
}
