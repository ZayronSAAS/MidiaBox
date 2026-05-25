import { Sidebar } from "@/components/shared/sidebar"

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-[53px] md:pt-0">
        {children}
      </main>
    </div>
  )
}
