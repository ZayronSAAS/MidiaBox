"use client"

import { useState } from "react"
import { Task, Client } from "@/types"
import { Plus, X, Check } from "lucide-react"
import { createTask, updateTask, deleteTask } from "@/lib/tasks-service"
import { cn } from "@/lib/utils"

interface TasksWidgetProps {
  tasks: Task[]
  clients: Client[]
  today: string  // "YYYY-MM-DD"
  onTasksChange: (tasks: Task[]) => void
}

export function TasksWidget({ tasks, clients, today, onTasksChange }: TasksWidgetProps) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState("")
  const [newClientId, setNewClientId] = useState<string>("")

  // Sort: undone first, then done — each group by createdAt asc
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  async function handleToggle(task: Task) {
    const updated = { ...task, done: !task.done }
    onTasksChange(tasks.map(t => t.id === task.id ? updated : t))
    await updateTask(task.id, { done: !task.done })
  }

  async function handleDelete(id: string) {
    onTasksChange(tasks.filter(t => t.id !== id))
    await deleteTask(id)
  }

  async function handleAdd() {
    if (!newText.trim()) return
    const created = await createTask({
      text: newText.trim(),
      clientId: newClientId || null,
      done: false,
      date: today,
    })
    if (created) onTasksChange([...tasks, created])
    setNewText("")
    setNewClientId("")
    setAdding(false)
  }

  function getClientColor(clientId: string | null) {
    return clients.find(c => c.id === clientId)?.color ?? "#6366f1"
  }
  function getClientName(clientId: string | null) {
    return clients.find(c => c.id === clientId)?.name ?? null
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-900">Tarefas do dia</p>
        <button
          onClick={() => setAdding(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <input
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false) }}
            placeholder="Descrição da tarefa..."
            className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-violet-400 text-slate-800 placeholder:text-slate-400"
          />
          <div className="flex gap-2">
            <select
              value={newClientId}
              onChange={e => setNewClientId(e.target.value)}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-violet-400 text-slate-700"
            >
              <option value="">Sem cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-md hover:bg-violet-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {sorted.length === 0 && !adding ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Nenhuma tarefa para hoje.</p>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto flex-1">
          {sorted.map(task => {
            const name = getClientName(task.clientId)
            const color = getClientColor(task.clientId)
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-2.5 p-2.5 rounded-lg group transition-colors",
                  task.done ? "opacity-60" : "hover:bg-slate-50"
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                    task.done
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 hover:border-emerald-400"
                  )}
                >
                  {task.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </button>

                {/* Text + tag */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs text-slate-700 leading-snug", task.done && "line-through text-slate-400")}>
                    {task.text}
                  </p>
                  {name && (
                    <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: color }}>
                      {name}
                    </span>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
