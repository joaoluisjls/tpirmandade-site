"use client";

import { useState, useEffect, useRef } from "react";

const APPROVAL_KEY = "tpi_user_approved";
const EMAIL_KEY = "tpi_user_email";

const ROLE_OPTIONS = [
  { id: "fullgas", label: "Full Gas" },
  { id: "rush", label: "Rush" },
  { id: "suporte", label: "Suporte" },
  { id: "capitao", label: "Capitao" },
  { id: "granadeiro", label: "Granadeiro" },
  { id: "curandeiro", label: "Curandeiro" },
];

export function Gate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "gate" | "pending" | "approved">("loading");
  const [recruiting, setRecruiting] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [form, setForm] = useState({
    email: "",
    nick: "",
    name: "",
    age: "",
    ffId: "",
    points: "",
    experience: "",
    whatsapp: "",
    reason: "",
  });

  const [checkEmail, setCheckEmail] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const approved = localStorage.getItem(APPROVAL_KEY);
    const savedEmail = localStorage.getItem(EMAIL_KEY);

    if (approved === "true") {
      setStatus("approved");
      return;
    }

    if (savedEmail) {
      setForm((f) => ({ ...f, email: savedEmail }));
      setCheckEmail(savedEmail);
      checkAccess(savedEmail);
      return;
    }

    setStatus("gate");
  }, []);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/auth/check-access?email=${encodeURIComponent(checkEmail)}`);
      const data = await res.json();
      if (data.approved) {
        localStorage.setItem(APPROVAL_KEY, "true");
        localStorage.setItem(EMAIL_KEY, checkEmail);
        setStatus("approved");
      } else {
        setForm((f) => ({ ...f, email: checkEmail }));
        setStatus("gate");
      }
    } catch {
      setForm((f) => ({ ...f, email: checkEmail }));
      setStatus("gate");
    } finally {
      setChecking(false);
    }
  };

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

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Foto muito grande (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoName(file.name); };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhoto(""); setPhotoName(""); if (fileRef.current) fileRef.current.value = ""; };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleRole = (id: string) => {
    setRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleRecruit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.nick || !form.name || !form.age || !form.ffId || !form.points || !form.experience || !form.whatsapp || !form.reason) {
      setError("Preencha todos os campos obrigatorios");
      return;
    }
    if (roles.length === 0) {
      setError("Selecione pelo menos uma funcao no Free Fire");
      return;
    }
    if (!photo) {
      setError("Envie sua foto de perfil");
      return;
    }

    setRecruiting(true);
    setError("");

    try {
      const res = await fetch("/api/recruitment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: form.nick,
          name: form.name,
          age: Number(form.age) || 0,
          ff_id: form.ffId,
          points: Number(form.points) || 0,
          experience: form.experience,
          reason: form.reason,
          contact: form.whatsapp,
          email: form.email,
          photo: photo || null,
          roles,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");

      localStorage.setItem(EMAIL_KEY, form.email);
      setStatus("pending");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar recrutamento");
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

  if (status === "gate" && !form.email) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">TP&IRMANDADE</h1>
          <p className="text-white/40 text-sm mb-6">Para acessar o site, faca seu recrutamento</p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Voce ja tem cadastro?</h2>
            <p className="text-white/30 text-sm mb-4">Coloque seu email para verificar se ja foi aprovado</p>
            <form onSubmit={handleCheckEmail} className="space-y-3">
              <input type="email" value={checkEmail} onChange={(e) => setCheckEmail(e.target.value)} required placeholder="seu@email.com" className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
              <button type="submit" disabled={checking} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80 disabled:opacity-50">
                {checking ? "Verificando..." : "Verificar"}
              </button>
            </form>
            <button onClick={() => setForm({ ...form, email: " " })} className="mt-4 text-xs text-white/20 hover:text-white/40 transition-colors">
              Nao tenho cadastro - quero me inscrever
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-3">Aguardando Aprovacao</h1>
          <p className="text-white/40 text-sm mb-6">
            Seu pedido de recrutamento foi enviado. Um administrador ira analisar e liberar seu acesso.
          </p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6">
            <p className="text-xs text-white/30 mb-1">Email cadastrado:</p>
            <p className="text-sm text-primary font-bold">{form.email}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Aguardando aprovacao do administrador...
          </div>
          <button onClick={() => { localStorage.removeItem(APPROVAL_KEY); localStorage.removeItem(EMAIL_KEY); setStatus("gate"); }} className="mt-6 text-xs text-white/20 hover:text-white/40 transition-colors">
            Usar outro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-1">TP&IRMANDADE</h1>
          <p className="text-white/40 text-sm">Para acessar o site, faca seu recrutamento</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recrutamento</h2>

          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2 mb-3">{error}</div>}

          <form onSubmit={handleRecruit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nick *</label>
                <input type="text" name="nick" value={form.nick} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="SeuNick" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nome Completo *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Idade *</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="18" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">ID Free Fire *</label>
                <input type="text" name="ffId" value={form.ffId} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="123456789" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Pontos Atuais da Guerras de Guildas *</label>
                <input type="number" name="points" value={form.points} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Experiencia *</label>
                <select name="experience" value={form.experience} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                  <option value="" className="bg-[#0a0a0f]">Selecione</option>
                  <option value="iniciante" className="bg-[#0a0a0f]">Iniciante</option>
                  <option value="intermediario" className="bg-[#0a0a0f]">Intermediario</option>
                  <option value="avancado" className="bg-[#0a0a0f]">Avancado</option>
                  <option value="profissional" className="bg-[#0a0a0f]">Profissional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">WhatsApp *</label>
                <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Funcao no Free Fire (ate 3) *</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((r) => {
                  const selected = roles.includes(r.id);
                  return (
                    <button key={r.id} type="button" onClick={() => toggleRole(r.id)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${selected ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {roles.length > 0 && <p className="text-[10px] text-white/20 mt-1">{roles.length}/3 selecionadas</p>}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="gate-photo" />
                <label htmlFor="gate-photo" className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                  {photoName ? "Trocar foto" : "Escolher foto *"}
                </label>
                {photoName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 truncate max-w-[120px]">{photoName}</span>
                    <button type="button" onClick={removePhoto} className="text-red-400 text-xs hover:text-red-300">x</button>
                  </div>
                )}
              </div>
              {photo && (
                <div className="mt-2">
                  <img src={photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Por que quer entrar? *</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} required rows={2} placeholder="Conte-nos por que quer fazer parte..." className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none" />
            </div>

            <button type="submit" disabled={recruiting} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
              {recruiting ? "Enviando..." : "ENVIAR RECRUTAMENTO"}
            </button>
          </form>

          <p className="text-[10px] text-white/20 text-center mt-3">
            Apos enviar, aguarde um administrador liberar seu acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
