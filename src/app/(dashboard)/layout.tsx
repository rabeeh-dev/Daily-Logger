import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] mt-[56px] p-[28px] bg-[#000000] min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}
