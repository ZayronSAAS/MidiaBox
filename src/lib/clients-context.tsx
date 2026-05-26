"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { mockClients } from "./mock-data"
import type { Client } from "@/types"

interface ClientsContextType {
  clients: Client[]
  deleteClient: (id: string) => void
  updateClient: (id: string, data: Partial<Client>) => void
  addClient: (client: Client) => void
}

const ClientsContext = createContext<ClientsContextType | null>(null)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)

  function deleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  function updateClient(id: string, data: Partial<Client>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  function addClient(client: Client) {
    setClients((prev) => [...prev, client])
  }

  return (
    <ClientsContext.Provider value={{ clients, deleteClient, updateClient, addClient }}>
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error("useClients must be used within ClientsProvider")
  return ctx
}
