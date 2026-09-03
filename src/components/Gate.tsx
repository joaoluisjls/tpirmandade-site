"use client";

import { useState, useEffect } from "react";

const APPROVAL_KEY = "tpi_user_approved";
const EMAIL_KEY = "tpi_user_email";
const RECRUITMENT_KEY = "tpi_recruitment_requests";

export function Gate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "gate" | "pending" | "approved">("loading");
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [recruiting, setRecruiting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const approved = localStorage.getItem(APPROVAL_KEY);
    const savedEmail = localStorage.getItem(EMAIL_KEY);

    if (approved === "true") {
      setStatus("approved");
      return;
    }

    if (savedEmail) {
      setEmail(savedEmail);
      checkAccess(savedEmail);
      return;
    }

    setStatus("gate");
  }, []);

  const checkAccess = async (emailToCheck: string) => {
    try {
      const res = await fetch(`/api/auth/check-access?email=${encodeURIComponent(emailToCheck)}`);
      const data = await res.json();
      if (data.approved) {
        localStorage.setItem(APPROVAL_KEY, "true");
        setStatus("approved");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  };

  const handleRecruit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nick) { setError("Email e nick são obrigatórios"); return; }

    setRecruiting(true);
    setError("");

    try {
      // Save to localStorage for admin to see
      const requests = JSON.parse(localStorage.getItem(RECRUITMENT_KEY) || "[]");
      const newRequest = {
        id: `req_${Date.now()}`,
        nick,
        name: nick,
        age: 0,
        ff_id: "",
        points: 0,
        experience: "",
        reason: "Recrutamento via site",
        contact: whatsapp,
        status: "pending",
        created_at: new Date().toISOString(),
        photo: null,
      };
      requests.push(newRequest);
      localStorage.setItem(RECRUITMENT_KEY, JSON.stringify(requests));

      // Save email for later check
      localStorage.setItem(EMAIL_KEY, email);
      setStatus("pending");
    } catch {
      setError("Erro ao enviar recrutamento");
    } finally {
      setRecruiting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/40 text-sm">Carregando...</div>
      </div>
    );
  }

  if (status === "approved") {
    return <>{children}</>;
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">Aguardando Aprovação</h1>
          <p className="text-white/40 text-sm mb-6">
            Seu pedido de recrutamento foi enviado. Um administrador irá analisar e liberar seu acesso.
          </p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6">
            <p className="text-xs text-white/30 mb-1">Email cadastrado:</p>
            <p className="text-sm text-primary font-bold">{email}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Aguardando aprovação do administrador...
          </div>
          <button onClick={() => { localStorage.removeItem(APPROVAL_KEY); localStorage.removeItem(EMAIL_KEY); setStatus("gate"); }} className="mt-6 text-xs text-white/20 hover:text-white/40 transition-colors">
            Usar outro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white mb-2">TP&IRMANDADE</h1>
          <p className="text-white/40 text-sm">Para acessar o site, faça seu recrutamento</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">📋 Recrutamento</h2>

          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2 mb-3">{error}</div>}

          <form onSubmit={handleRecruit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Seu Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nick no Free Fire *</label>
              <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="SeuNick" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">WhatsApp (opcional)</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="(00) 00000-0000" />
            </div>
            <button type="submit" disabled={recruiting} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
              {recruiting ? "Enviando..." : "ENVIAR RECRUTAMENTO"}
            </button>
          </form>

          <p className="text-[10px] text-white/20 text-center mt-4">
            Após enviar, aguarde um administrador liberar seu acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
