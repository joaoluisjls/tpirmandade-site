export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  responsible: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach1",
    title: "CAMPEÕES DA GUERRA",
    description: "Primeiro lugar na temporada competitiva atual.",
    date: "20/08/2026",
    icon: "🏆",
    responsible: "Toda a guilda",
  },
  {
    id: "ach2",
    title: "10 GUERRAS INVICTOS",
    description: "Sequência histórica de 10 vitórias consecutivas.",
    date: "15/08/2026",
    icon: "🔥",
    responsible: "Toda a guilda",
  },
  {
    id: "ach3",
    title: "100 MVPs",
    description: "Marca de 100 MVPs coletados pela guilda.",
    date: "10/08/2026",
    icon: "⭐",
    responsible: "Toda a guilda",
  },
  {
    id: "ach4",
    title: "MAIOR K/D DA TEMPORADA",
    description: "Player01 alcançou K/D de 4.82, o maior da temporada.",
    date: "08/08/2026",
    icon: "🎯",
    responsible: "Player01",
  },
  {
    id: "ach5",
    title: "1000 ABATES",
    description: "Guilda ultrapassou a marca de 1000 abates no mês.",
    date: "05/08/2026",
    icon: "💀",
    responsible: "Toda a guilda",
  },
  {
    id: "ach6",
    title: "NOVA ERA",
    description: "Expansão da equipe com 5 novos membros recrutados.",
    date: "01/08/2026",
    icon: "🚀",
    responsible: "Liderança",
  },
];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann1",
    title: "GUERRA HOJE",
    content: "Todos os membros devem estar disponíveis às 20h. Preparação máxima!",
    date: "28/08/2026",
    time: "14:00",
    priority: "high",
  },
  {
    id: "ann2",
    title: "NOVO MVP",
    content: "Parabéns ao Player01 pelo desempenho excepcional da semana! K/D de 4.82.",
    date: "27/08/2026",
    time: "10:00",
    priority: "medium",
  },
  {
    id: "ann3",
    title: "RECRUTAMENTO ABERTO",
    content: "Estamos recrutando novos membros. Indiquem jogadores comprometidos.",
    date: "25/08/2026",
    time: "08:00",
    priority: "low",
  },
  {
    id: "ann4",
    title: "REGRAS ATUALIZADAS",
    content: "As regras da guilda foram atualizadas. Leiam com atenção.",
    date: "22/08/2026",
    time: "16:00",
    priority: "medium",
  },
];

export const RULES = [
  {
    id: 1,
    text: "Respeitar todos os membros da guilda.",
    category: "respeito",
  },
  {
    id: 2,
    text: "Participar das guerras de guilda quando convocado.",
    category: "participação",
  },
  {
    id: 3,
    text: "Não praticar racismo, preconceito ou qualquer forma de discriminação.",
    category: "respeito",
    highlighted: true,
  },
  {
    id: 4,
    text: "Não causar conflitos desnecessários dentro da guilda.",
    category: "conduta",
  },
  {
    id: 5,
    text: "Representar a guilda com respeito em todas as partidas.",
    category: "conduta",
  },
  {
    id: 6,
    text: "Manter atividade mínima dentro da guilda.",
    category: "participação",
  },
  {
    id: 7,
    text: "Respeitar líderes e membros da guilda.",
    category: "respeito",
  },
  {
    id: 8,
    text: "Não utilizar trapaças, hacks ou qualquer forma de vantagem injusta.",
    category: "conduta",
    highlighted: true,
  },
  {
    id: 9,
    text: "Trabalhar em equipe e colaborar com os companheiros.",
    category: "participação",
  },
  {
    id: 10,
    text: "Buscar sempre evoluir como jogador e como pessoa.",
    category: "evolução",
  },
];

export const GUILD_HISTORY = [
  {
    year: "2024",
    title: "Fundação da Guilda",
    description: "TP&IRMANDADE nasce com o objetivo de criar uma comunidade forte e competitiva.",
  },
  {
    year: "2025",
    title: "Primeira Grande Conquista",
    description: "A guilda conquista seu primeiro título em campeonato regional.",
  },
  {
    year: "2026",
    title: "Expansão da Equipe",
    description: "A equipe cresce para 18 membros ativos, expandindo seu alcance competitivo.",
  },
  {
    year: "2026",
    title: "Nova Temporada Competitiva",
    description: "Início de uma nova era com ranking crescente e estatísticas recordes.",
  },
];
