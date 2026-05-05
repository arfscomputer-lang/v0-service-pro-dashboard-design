"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { MessageSquare, Send, Loader2, RefreshCw, User } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  from_user_id: string
  from_name: string
  from_role: string
  text: string
  created_at: string
}

interface Thread {
  thread_key: string
  tech_user_id: string
  tech_name: string
  target_role: string
  last_message: string
  last_at: string
}

export default function MensajesAdminPage() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const myRole = user?.role ?? "admin"

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/messages")
      if (!res.ok) return
      const json = await res.json()
      const all: Thread[] = json.data || []
      // Admin sees all; supervisor sees only threads with target_role=supervisor
      const filtered = myRole === "admin" ? all : all.filter((t) => t.target_role === "supervisor")
      setThreads(filtered.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime()))
    } catch {}
  }, [myRole])

  const fetchMessages = useCallback(async (thread: Thread) => {
    try {
      const res = await fetch(`/api/messages?thread_key=${thread.thread_key}`)
      if (!res.ok) return
      const json = await res.json()
      setMessages(json.data || [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchThreads().finally(() => setLoadingThreads(false))
    const interval = setInterval(fetchThreads, 5000)
    return () => clearInterval(interval)
  }, [fetchThreads])

  useEffect(() => {
    if (!activeThread) return
    setLoadingMsgs(true)
    fetchMessages(activeThread).finally(() => setLoadingMsgs(false))

    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchMessages(activeThread), 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeThread, fetchMessages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || !user || !activeThread) return
    setSending(true)
    setInput("")
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tech_user_id: activeThread.tech_user_id,
          tech_name: activeThread.tech_name,
          target_role: activeThread.target_role,
          from_user_id: user.id,
          from_name: user.name,
          from_role: user.role,
          text,
        }),
      })
      await fetchMessages(activeThread)
      await fetchThreads()
    } catch {} finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 overflow-hidden">

          {/* Thread list */}
          <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Conversaciones</span>
              </div>
              <button type="button" onClick={fetchThreads} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingThreads ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Cargando...</span>
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center px-4">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Sin conversaciones todavía</p>
                </div>
              ) : (
                threads.map((t) => (
                  <button key={t.thread_key} type="button" onClick={() => setActiveThread(t)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border transition-colors",
                      activeThread?.thread_key === t.thread_key ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"
                    )}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.tech_name}</p>
                        <p className="text-[10px] text-muted-foreground">→ {t.target_role}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(t.last_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate pl-9">{t.last_message}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {!activeThread ? (
              <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Seleccioná una conversación</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activeThread.tech_name}</p>
                    <p className="text-xs text-muted-foreground">Técnico · conversación con {activeThread.target_role}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Cargando...</span>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.from_user_id === user?.id
                      const isAdmin = msg.from_role === "admin" || msg.from_role === "supervisor"
                      return (
                        <div key={msg.id} className={cn("flex", isMe || isAdmin ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[65%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                            isMe || isAdmin
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card border border-border text-foreground rounded-bl-sm"
                          )}>
                            <p className={cn("text-[10px] font-semibold mb-0.5", isMe || isAdmin ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {msg.from_name}
                            </p>
                            <p>{msg.text}</p>
                            <p className={cn("text-[10px] mt-1 text-right", isMe || isAdmin ? "text-primary-foreground/60" : "text-muted-foreground")}>
                              {new Date(msg.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={endRef} />
                </div>

                <div className="border-t border-border px-5 py-3 flex gap-2 bg-card">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                    placeholder={`Responder a ${activeThread.tech_name}...`}
                    className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={send} disabled={!input.trim() || sending}
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                      input.trim() && !sending ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground")}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
