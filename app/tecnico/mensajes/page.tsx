"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { Send, MessageSquare, Loader2, RefreshCw } from "lucide-react"
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

const CONTACTS = [
  { id: "admin",      label: "Admin",      initials: "AD", color: "bg-primary" },
  { id: "supervisor", label: "Supervisor", initials: "SV", color: "bg-violet-600" },
]

export default function MensajesPage() {
  const { user } = useAuth()
  const [activeContact, setActiveContact] = useState(CONTACTS[0].id)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/messages?tech_user_id=${user.id}&target_role=${activeContact}`)
      if (!res.ok) return
      const json = await res.json()
      setMessages(json.data || [])
    } catch {}
  }, [user?.id, activeContact])

  useEffect(() => {
    setMessages([])
    setLoading(true)
    fetchMessages().finally(() => setLoading(false))

    // Poll every 5s for new messages
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchMessages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || !user) return
    setSending(true)
    setInput("")
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tech_user_id: user.id,
          tech_name: user.name,
          target_role: activeContact,
          from_user_id: user.id,
          from_name: user.name,
          from_role: user.role,
          text,
        }),
      })
      await fetchMessages()
    } catch {} finally {
      setSending(false)
    }
  }

  const contact = CONTACTS.find((c) => c.id === activeContact)!

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />

      {/* Contact tabs */}
      <div className="flex border-b border-border bg-card px-4 pt-3 gap-2">
        {CONTACTS.map((c) => (
          <button key={c.id} type="button" onClick={() => setActiveContact(c.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
              activeContact === c.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold", c.color)}>
              {c.initials}
            </span>
            {c.label}
          </button>
        ))}
        <button type="button" onClick={fetchMessages} className="ml-auto text-muted-foreground hover:text-foreground p-2">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Cargando mensajes...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin mensajes aún</p>
            <p className="text-xs mt-1 opacity-60">Iniciá una conversación con {contact.label}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.from_user_id === user?.id
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold mr-2 mt-1", contact.color)}>
                    {contact.initials}
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"
                )}>
                  {!isMe && <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.from_name}</p>}
                  <p>{msg.text}</p>
                  <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {new Date(msg.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 bg-card border-t border-border px-4 py-3 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={`Mensaje para ${contact.label}...`}
          className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <button type="button" onClick={send} disabled={!input.trim() || sending}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            input.trim() && !sending ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground")}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      <BottomTabs />
    </div>
  )
}
