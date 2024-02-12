import { Sidebar } from "@/components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar currentPath="/dashboard" />
      <div className="p-4 ml-[300px] w-full h-1/2">
        <h1 className="text-4xl text-blue-800">Dashboard</h1>
      </div>
    </div>
  );
}
