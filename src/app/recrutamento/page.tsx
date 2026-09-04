"use client";

import { useState, useRef } from "react";

const ROLE_OPTIONS = [
  { id: "fullgas", label: "Full Gas" },
  { id: "rush", label: "Rush" },
  { id: "suporte", label: "Suporte" },
  { id: "capitao", label: "Capitao" },
  { id: "granadeiro", label: "Granadeiro" },
  { id: "curandeiro", label: "Curandeiro" },
];

export default function RecrutamentoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [form, setForm] = useState({ nick: "", name: "", age: "", ffId: "", email: "", experience: "", reason: "", contact: "", points: "" });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Foto muito grande (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoName(file.name); };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { setPhoto(""); setPhotoName(""); if (fileRef.current) fileRef.current.value = ""; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nick || !form.name || !form.age || !form.ffId || !form.email || !form.points || !form.experience || !form.contact || !form.reason) {
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
    setLoading(true);
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
          contact: form.contact,
          email: form.email,
          photo,
          roles,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleRole = (id: string) => {
    setRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (submitted) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center rounded-2xl border border-white/5 bg-white/[0.02] p-10">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">RECRUTAMENTO ENVIADO!</h1>
          <p className="text-white/40 mb-6">Obrigado pelo interesse! Analisaremos seu perfil e entraremos em contato.</p>
          <button onClick={() => { setSubmitted(false); setPhoto(""); setPhotoName(""); setRoles([]); setForm({ nick: "", name: "", age: "", ffId: "", email: "", experience: "", reason: "", contact: "", points: "" }); }} className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors">
            Enviar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-4">🎮 QUER FAZER PARTE DA TROPA?</h1>
        <p className="text-white/40 text-center mb-8 italic">&ldquo;Estamos sempre procurando jogadores que queiram evoluir e competir.&rdquo;</p>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "nick", label: "Nick no Free Fire", type: "text", required: true, sm: false },
              { name: "name", label: "Nome", type: "text", required: true, sm: false },
              { name: "age", label: "Idade", type: "number", required: true, sm: false },
              { name: "ffId", label: "ID do Free Fire", type: "text", required: true, sm: false },
              { name: "email", label: "Email", type: "email", required: true, sm: false },
              { name: "points", label: "Pontos Atuais da Guerras de Guildas", type: "number", required: true, sm: false },
              { name: "experience", label: "Experiencia", type: "select", required: true, sm: false },
              { name: "contact", label: "WhatsApp / Discord", type: "text", required: true, sm: true },
            ].map((field) => (
              <div key={field.name} className={field.sm ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{field.label} {field.required && "*"}</label>
                {field.type === "select" ? (
                  <select name={field.name} value={form[field.name as keyof typeof form]} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-[#0a0a0f]">Selecione</option>
                    <option value="iniciante" className="bg-[#0a0a0f]">Iniciante</option>
                    <option value="intermediario" className="bg-[#0a0a0f]">Intermediário</option>
                    <option value="avancado" className="bg-[#0a0a0f]">Avançado</option>
                    <option value="profissional" className="bg-[#0a0a0f]">Profissional</option>
                  </select>
                ) : (
                  <input type={field.type} name={field.name} value={form[field.name as keyof typeof form]} onChange={handleChange} required={field.required} placeholder={field.label} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Funcao no Free Fire (ate 3) *</label>
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Por que quer entrar? *</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} required rows={3} placeholder="Conte-nos por que quer fazer parte..." className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Sua foto *</label>
              <div className="flex items-center gap-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                  {photoName ? "Trocar foto" : "Escolher foto"}
                </label>
                {photoName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 truncate max-w-[150px]">{photoName}</span>
                    <button type="button" onClick={removePhoto} className="text-red-400 text-xs hover:text-red-300">✕</button>
                  </div>
                )}
              </div>
              {photo && (
                <div className="mt-3">
                  <img src={photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 text-center">
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
              {loading ? "ENVIANDO..." : "ENVIAR RECRUTAMENTO"}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
