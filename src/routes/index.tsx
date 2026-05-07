import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";
import { Send, LogOut, Sparkles, Package, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

type Order = {
  id: string;
  buyer_id: string;
  part_name: string;
  material: string | null;
  quantity: number;
  deadline: string | null;
  status: "Received" | "In Review" | "Accepted";
  created_at: string;
  updated_at: string;
};
type QNote = { id: string; order_id: string; note: string; created_at: string };
type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

function Index() {
  const { user, loading, isOps, signOut, session } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Record<string, QNote[]>>({});
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const refresh = async () => {
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((o ?? []) as Order[]);
    const ids = (o ?? []).map((x: Order) => x.id);
    if (ids.length) {
      const { data: n } = await supabase.from("quality_notes").select("*").in("order_id", ids).order("created_at", { ascending: false });
      const map: Record<string, QNote[]> = {};
      (n ?? []).forEach((x: QNote) => { (map[x.order_id] ??= []).push(x); });
      setNotes(map);
    } else setNotes({});
  };

  useEffect(() => {
    if (!user) return;
    refresh();
    const ch = supabase
      .channel("orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "quality_notes" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text };
    setChat((c) => [...c, userMsg]);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-command", { body: { message: text } });
      if (error) throw error;
      if ((data as any)?.error) {
        setChat((c) => [...c, { id: crypto.randomUUID(), role: "assistant", text: (data as any).error }]);
        toast.error((data as any).error);
      } else {
        const reply = (data as any)?.message ?? "Done.";
        setChat((c) => [...c, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
      }
    } catch (e: any) {
      const msg = e?.context?.error ?? e?.message ?? "Request failed";
      setChat((c) => [...c, { id: crypto.randomUUID(), role: "assistant", text: msg }]);
      toast.error(msg);
    } finally { setSending(false); }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const examples = isOps
    ? [
        "Update order <paste-id> to In Review",
        "Add quality note to <paste-id>: surface scratches on 3 units",
        "Set <paste-id> status to Accepted",
      ]
    : [
        "Need 50 stainless steel brackets, 200x100mm, by next Friday",
        "Order 25 aluminum housings, deadline 2026-06-01",
        "Create order: 100 brass fittings, due in 3 weeks",
      ];

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-surface)" }}>
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-brand)" }}>
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none">OrderFlow</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{sanitizeText(user.email)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOps ? "default" : "secondary"} className="gap-1">
              <ShieldCheck className="w-3 h-3" />{isOps ? "Ops" : "Buyer"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-1" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-[420px_1fr] gap-6">
        {/* Chat */}
        <Card className="flex flex-col h-[calc(100vh-7rem)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-medium text-sm">NLP Assistant</h2>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Try one of these:</p>
                {examples.map((ex) => (
                  <button key={ex} onClick={() => setInput(ex)} className="block text-left w-full px-3 py-2 rounded-md bg-muted hover:bg-accent transition text-foreground text-xs">
                    {ex}
                  </button>
                ))}
              </div>
            )}
            {chat.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {sanitizeText(m.text)}
                </div>
              </div>
            ))}
            {sending && <div className="text-xs text-muted-foreground">Thinking…</div>}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder={isOps ? "e.g. update <id> to Accepted" : "e.g. need 50 steel brackets by Friday"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              maxLength={4000}
              disabled={sending}
            />
            <Button onClick={send} disabled={sending || !input.trim()} size="icon"><Send className="w-4 h-4" /></Button>
          </div>
        </Card>

        {/* Dashboard */}
        <Card className="shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h2 className="font-medium text-sm">Order Dashboard</h2>
            <span className="text-xs text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            {orders.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">No orders yet — create one from the chat.</div>
            ) : (
              <ul className="divide-y">
                {orders.map((o) => {
                  const latest = notes[o.id]?.[0];
                  return (
                    <li key={o.id} className="p-5 hover:bg-muted/40 transition">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{sanitizeText(o.part_name)}</h3>
                            <StatusBadge status={o.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{o.id}</p>
                          <div className="text-sm mt-2 flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
                            <span>Qty: <span className="text-foreground font-medium">{o.quantity}</span></span>
                            {o.material && <span>Material: <span className="text-foreground">{sanitizeText(o.material)}</span></span>}
                            {o.deadline && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{o.deadline}</span>}
                          </div>
                        </div>
                      </div>
                      {latest && (
                        <div className="mt-3 text-xs bg-accent/50 border border-accent rounded-md px-3 py-2">
                          <div className="text-muted-foreground mb-0.5">Latest quality note · {new Date(latest.created_at).toLocaleString()}</div>
                          <div className="text-foreground">{sanitizeText(latest.note)}</div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles =
    status === "Accepted" ? "bg-[var(--success)] text-white" :
    status === "In Review" ? "bg-[var(--warning)] text-black" :
    "bg-[var(--info)] text-white";
  return <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold ${styles}`}>{status}</span>;
}
