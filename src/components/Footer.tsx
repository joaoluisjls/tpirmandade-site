import Link from "next/link";
import { GUILD } from "@/data/guild";

const FOOTER_LINKS = [
  { href: "/", label: "Início" },
  { href: "/ranking", label: "Ranking" },
  { href: "/mvp", label: "MVP" },
  { href: "/jogadores", label: "Jogadores" },
  { href: "/guerras", label: "Guerras" },
  { href: "/regras", label: "Regras" },
  { href: "/recrutamento", label: "Recrutamento" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-3">
              <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-9 h-9 rounded-lg object-cover" />
              <span className="font-bold text-sm text-white">{GUILD.name}</span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">Estamos aqui para somar. Competitividade, união e evolução.</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Navegação</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/40 hover:text-primary transition-colors py-0.5">{link.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Redes Sociais</h3>
            <div className="flex gap-2">
              {[
                { name: "Discord", href: GUILD.discord, icon: "D" },
                { name: "Instagram", href: GUILD.instagram, icon: "I" },
                { name: "TikTok", href: GUILD.tiktok, icon: "T" },
                { name: "YouTube", href: GUILD.youtube, icon: "Y" },
              ].map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-white/40 hover:text-white hover:bg-primary/20 transition-all" title={s.name}>{s.icon}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 {GUILD.name}. Todos os direitos reservados.</p>
          <p className="text-xs text-white/20">Desenvolvido por <span className="text-white/40">{GUILD.owner}</span></p>
        </div>
      </div>
    </footer>
  );
}
