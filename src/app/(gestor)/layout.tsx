import { Sidebar } from "@/components/shared/sidebar"
import { ClientsProvider } from "@/lib/clients-context"

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientsProvider>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-[53px] md:pt-0">
          {children}
        </main>
      </div>
    </ClientsProvider>
  )
}
