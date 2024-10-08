import SideNav from "@/components/ui/side-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow m-2.5 md:overflow-y-auto border p-5">
        {children}
      </div>
    </main>
  );
}
