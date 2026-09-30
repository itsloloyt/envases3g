import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-scope min-h-[70dvh] pb-20">{children}</div>;
}
